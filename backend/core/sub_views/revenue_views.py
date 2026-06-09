# sub_views/revenue_views.py

from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response

from core.models import ServiceRecord


class RevenueSummaryView(APIView):

    def get(self, request):
        now = timezone.now()
        today = now.date()

        total = ServiceRecord.objects.filter(is_paid=True).aggregate(
            total=Sum('total_amount_due'), count=Count('id')
        )

        today_data = ServiceRecord.objects.filter(
            is_paid=True, payment_simulated_at__date=today
        ).aggregate(total=Sum('total_amount_due'), count=Count('id'))

        this_month = ServiceRecord.objects.filter(
            is_paid=True,
            payment_simulated_at__year=now.year,
            payment_simulated_at__month=now.month,
        ).aggregate(total=Sum('total_amount_due'), count=Count('id'))

        pending_count = ServiceRecord.objects.filter(is_paid=False).count()
        pending_value = ServiceRecord.objects.filter(is_paid=False).aggregate(
            total=Sum('total_amount_due')
        )

        return Response({
            'all_time': {
                'revenue': float(total['total'] or 0),
                'count': total['count'],
            },
            'today': {
                'revenue': float(today_data['total'] or 0),
                'count': today_data['count'],
            },
            'this_month': {
                'revenue': float(this_month['total'] or 0),
                'count': this_month['count'],
            },
            'pending': {
                'count': pending_count,
                'value': float(pending_value['total'] or 0),
            },
        })


class DailyRevenueView(APIView):

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timezone.timedelta(days=days)

        data = (
            ServiceRecord.objects
            .filter(is_paid=True, payment_simulated_at__gte=since)
            .annotate(day=TruncDay('payment_simulated_at'))
            .values('day')
            .annotate(revenue=Sum('total_amount_due'), count=Count('id'))
            .order_by('day')
        )

        return Response([
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'revenue': float(item['revenue'] or 0),
                'count': item['count'],
            }
            for item in data
        ])


class MonthlyRevenueView(APIView):

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        since = timezone.now() - timezone.timedelta(days=months * 30)

        data = (
            ServiceRecord.objects
            .filter(is_paid=True, payment_simulated_at__gte=since)
            .annotate(month=TruncMonth('payment_simulated_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount_due'), count=Count('id'))
            .order_by('month')
        )

        return Response([
            {
                'month': item['month'].strftime('%Y-%m'),
                'revenue': float(item['revenue'] or 0),
                'count': item['count'],
            }
            for item in data
        ])


class YearlyRevenueView(APIView):

    def get(self, request):
        data = (
            ServiceRecord.objects
            .filter(is_paid=True)
            .annotate(year=TruncYear('payment_simulated_at'))
            .values('year')
            .annotate(revenue=Sum('total_amount_due'), count=Count('id'))
            .order_by('year')
        )

        return Response([
            {
                'year': item['year'].strftime('%Y'),
                'revenue': float(item['revenue'] or 0),
                'count': item['count'],
            }
            for item in data
        ])
