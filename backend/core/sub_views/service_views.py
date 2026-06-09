# sub_views/service_views.py

from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.models import ServiceRecord, ServiceIssue
from core.serializers import ServiceRecordSerializer, ServiceRecordListSerializer, ServiceIssueSerializer


class ServiceRecordListCreateView(APIView):

    def get(self, request):
        records = ServiceRecord.objects.select_related('vehicle').all()
        serializer = ServiceRecordListSerializer(records, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ServiceRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceRecordDetailView(APIView):

    def get(self, request, pk):
        record = get_object_or_404(
            ServiceRecord.objects.prefetch_related('issues__component'),
            pk=pk
        )
        serializer = ServiceRecordSerializer(record)
        return Response(serializer.data)

    def put(self, request, pk):
        record = get_object_or_404(ServiceRecord, pk=pk)
        serializer = ServiceRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            record.refresh_from_db()
            record.recalculate_total()
            return Response(ServiceRecordSerializer(record).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = get_object_or_404(ServiceRecord, pk=pk)
        record.delete()
        return Response({'message': 'Record deleted.'}, status=status.HTTP_204_NO_CONTENT)


class ServiceIssueListCreateView(APIView):

    def get(self, request, service_id):
        record = get_object_or_404(ServiceRecord, pk=service_id)
        issues = record.issues.select_related('component').all()
        serializer = ServiceIssueSerializer(issues, many=True)
        return Response(serializer.data)

    def post(self, request, service_id):
        record = get_object_or_404(ServiceRecord, pk=service_id)
        data = request.data.copy()
        data['service_record'] = record.pk
        serializer = ServiceIssueSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            record.refresh_from_db()
            return Response(ServiceRecordSerializer(record).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceIssueDetailView(APIView):

    def put(self, request, pk):
        issue = get_object_or_404(ServiceIssue, pk=pk)
        serializer = ServiceIssueSerializer(issue, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            issue.service_record.recalculate_total()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        issue = get_object_or_404(ServiceIssue, pk=pk)
        record = issue.service_record
        issue.delete()
        record.recalculate_total()
        return Response({'message': 'Issue removed.'}, status=status.HTTP_204_NO_CONTENT)


class PaymentSimulationView(APIView):

    def post(self, request, pk):
        record = get_object_or_404(ServiceRecord, pk=pk)

        if record.is_paid:
            return Response({'error': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get('payment_method', 'cash')
        record.is_paid = True
        record.status = 'paid'
        record.payment_simulated_at = timezone.now()
        record.save(update_fields=['is_paid', 'status', 'payment_simulated_at', 'updated_at'])

        # auto-generate invoice
        from core.models import Invoice
        vehicle = record.vehicle
        issues = record.issues.all()
        subtotal = sum(i.calculated_price for i in issues)

        Invoice.objects.create(
            invoice_number=Invoice.generate_invoice_number(),
            service_record=record,
            owner_name=vehicle.owner_name,
            owner_phone=vehicle.owner_phone or '',
            vehicle_info=f"{vehicle.get_full_name()} ({vehicle.license_plate})",
            subtotal=subtotal,
            labor_charge=record.labor_charge,
            total_amount=record.total_amount_due,
            payment_method=payment_method,
        )

        return Response({
            'message': 'Payment processed and invoice generated.',
            'service_record_id': record.pk,
            'total_paid': str(record.total_amount_due),
            'payment_method': payment_method,
            'paid_at': record.payment_simulated_at,
        })
