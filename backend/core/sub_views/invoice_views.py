# sub_views/invoice_views.py

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.models import Invoice, ServiceRecord
from core.serializers import InvoiceSerializer


class InvoiceDetailView(APIView):
    """Get invoice for a specific service record."""

    def get(self, request, service_id):
        record = get_object_or_404(ServiceRecord, pk=service_id)
        try:
            invoice = record.invoice
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'No invoice found. Payment may not have been processed yet.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)


class InvoiceListView(APIView):
    """List all invoices."""

    def get(self, request):
        invoices = Invoice.objects.select_related('service_record__vehicle').all()
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)
