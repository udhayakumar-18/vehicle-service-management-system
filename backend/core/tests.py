from decimal import Decimal
from django.test import TestCase, Client
import json

from core.models import Component, Vehicle, ServiceRecord, ServiceIssue
from core.forms import ComponentForm, VehicleForm, ServiceRecordForm


# ─── Model Tests ───────────────────────────────────────────

class ComponentModelTest(TestCase):

    def setUp(self):
        self.component = Component.objects.create(
            name='Brake Pad',
            repair_price=Decimal('150.00'),
            new_purchase_price=Decimal('350.00'),
            stock_quantity=10,
        )

    def test_str(self):
        self.assertEqual(str(self.component), 'Brake Pad')

    def test_is_in_stock_true(self):
        self.assertTrue(self.component.is_in_stock())

    def test_is_in_stock_false_when_zero(self):
        self.component.stock_quantity = 0
        self.component.save()
        self.assertFalse(self.component.is_in_stock())

    def test_repair_price_stored_correctly(self):
        self.assertEqual(self.component.repair_price, Decimal('150.00'))

    def test_new_purchase_price_stored_correctly(self):
        self.assertEqual(self.component.new_purchase_price, Decimal('350.00'))


class VehicleModelTest(TestCase):

    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            license_plate='TN-01-AB-1234',
            make='Toyota', model='Camry', year=2020,
            owner_name='Ravi Kumar',
        )

    def test_str(self):
        self.assertIn('TN-01-AB-1234', str(self.vehicle))

    def test_get_full_name_with_year(self):
        self.assertEqual(self.vehicle.get_full_name(), '2020 Toyota Camry')

    def test_get_full_name_without_year(self):
        self.vehicle.year = None
        self.vehicle.save()
        self.assertEqual(self.vehicle.get_full_name(), 'Toyota Camry')

    def test_license_plate_unique(self):
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Vehicle.objects.create(
                license_plate='TN-01-AB-1234',
                make='Honda', model='City',
                owner_name='Someone Else',
            )


class ServiceRecordModelTest(TestCase):

    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            license_plate='KA-05-XY-9999',
            make='Honda', model='City',
            owner_name='Priya S',
        )
        self.component = Component.objects.create(
            name='Oil Filter',
            repair_price=Decimal('50.00'),
            new_purchase_price=Decimal('120.00'),
            stock_quantity=5,
        )
        self.record = ServiceRecord.objects.create(
            vehicle=self.vehicle,
            labor_charge=Decimal('200.00'),
        )

    def test_str_contains_license_plate(self):
        self.assertIn('KA-05-XY-9999', str(self.record))

    def test_recalculate_total_no_issues(self):
        self.record.recalculate_total()
        self.assertEqual(self.record.total_amount_due, Decimal('200.00'))

    def test_issue_uses_repair_price(self):
        issue = ServiceIssue.objects.create(
            service_record=self.record,
            description='Repair oil filter',
            component=self.component,
            action_type='repair',
        )
        self.assertEqual(issue.calculated_price, Decimal('50.00'))

    def test_issue_uses_new_price(self):
        issue = ServiceIssue.objects.create(
            service_record=self.record,
            description='Replace oil filter',
            component=self.component,
            action_type='new',
        )
        self.assertEqual(issue.calculated_price, Decimal('120.00'))

    def test_total_updates_after_issue_added(self):
        ServiceIssue.objects.create(
            service_record=self.record,
            description='Replace oil filter',
            component=self.component,
            action_type='new',
        )
        self.record.refresh_from_db()
        self.assertEqual(self.record.total_amount_due, Decimal('320.00'))  # 120 + 200


# ─── Form Tests ────────────────────────────────────────────

class ComponentFormTest(TestCase):

    def test_valid_form(self):
        data = {'name': 'Spark Plug', 'repair_price': '80.00', 'new_purchase_price': '200.00', 'stock_quantity': 10}
        form = ComponentForm(data=data)
        self.assertTrue(form.is_valid())

    def test_negative_repair_price_rejected(self):
        data = {'name': 'Bad Part', 'repair_price': '-10.00', 'new_purchase_price': '50.00', 'stock_quantity': 1}
        form = ComponentForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn('repair_price', form.errors)

    def test_missing_name_rejected(self):
        data = {'repair_price': '50.00', 'new_purchase_price': '100.00'}
        form = ComponentForm(data=data)
        self.assertFalse(form.is_valid())


class VehicleFormTest(TestCase):

    def test_valid_form_uppercases_plate(self):
        data = {'license_plate': 'mh-01-ab-1234', 'make': 'Maruti', 'model': 'Swift', 'owner_name': 'Karan'}
        form = VehicleForm(data=data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.cleaned_data['license_plate'], 'MH-01-AB-1234')

    def test_missing_owner_name_rejected(self):
        data = {'license_plate': 'DL-01-XY-9999', 'make': 'Hyundai', 'model': 'i20'}
        form = VehicleForm(data=data)
        self.assertFalse(form.is_valid())


# ─── View / API Tests ──────────────────────────────────────

class ComponentAPITest(TestCase):

    def setUp(self):
        self.client = Client()
        self.component = Component.objects.create(
            name='Brake Pad',
            repair_price=Decimal('150.00'),
            new_purchase_price=Decimal('350.00'),
            stock_quantity=10,
        )

    def test_list_components(self):
        res = self.client.get('/api/components/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_create_component(self):
        res = self.client.post('/api/components/', json.dumps({
            'name': 'Air Filter', 'repair_price': '80.00',
            'new_purchase_price': '200.00', 'stock_quantity': 5
        }), content_type='application/json')
        self.assertEqual(res.status_code, 201)

    def test_negative_price_rejected(self):
        res = self.client.post('/api/components/', json.dumps({
            'name': 'Bad', 'repair_price': '-10.00', 'new_purchase_price': '50.00'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 400)

    def test_update_stock(self):
        res = self.client.put(f'/api/components/{self.component.pk}/',
                              json.dumps({'stock_quantity': 25}),
                              content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['stock_quantity'], 25)

    def test_delete_component(self):
        res = self.client.delete(f'/api/components/{self.component.pk}/')
        self.assertEqual(res.status_code, 204)


class VehicleAPITest(TestCase):

    def setUp(self):
        self.client = Client()

    def test_create_vehicle(self):
        res = self.client.post('/api/vehicles/', json.dumps({
            'license_plate': 'GJ-01-AB-5555', 'make': 'Tata',
            'model': 'Nexon', 'year': 2022, 'owner_name': 'Shreya'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 201)

    def test_list_empty(self):
        res = self.client.get('/api/vehicles/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), [])


class ServiceAPITest(TestCase):

    def setUp(self):
        self.client = Client()
        self.vehicle = Vehicle.objects.create(
            license_plate='AP-09-ZZ-1111', make='Mahindra',
            model='XUV700', owner_name='Arun'
        )
        self.component = Component.objects.create(
            name='Tyre', repair_price=Decimal('800.00'),
            new_purchase_price=Decimal('3500.00'), stock_quantity=4
        )

    def test_create_service_record(self):
        res = self.client.post('/api/services/', json.dumps({
            'vehicle': self.vehicle.pk, 'labor_charge': '500.00'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 201)

    def test_add_issue_recalculates_total(self):
        record = ServiceRecord.objects.create(vehicle=self.vehicle, labor_charge=Decimal('500.00'))
        res = self.client.post(f'/api/services/{record.pk}/issues/', json.dumps({
            'description': 'Flat tyre', 'component': self.component.pk, 'action_type': 'new'
        }), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        # 3500 (new) + 500 (labor) = 4000
        self.assertEqual(float(res.json()['total_amount_due']), 4000.00)

    def test_payment_simulation(self):
        record = ServiceRecord.objects.create(
            vehicle=self.vehicle, labor_charge=Decimal('1000.00'),
            total_amount_due=Decimal('1000.00')
        )
        res = self.client.post(f'/api/services/{record.pk}/pay/',
                               json.dumps({'payment_method': 'card'}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['total_paid'], '1000.00')

    def test_double_payment_rejected(self):
        record = ServiceRecord.objects.create(
            vehicle=self.vehicle, labor_charge=Decimal('500.00'),
            total_amount_due=Decimal('500.00'), is_paid=True
        )
        res = self.client.post(f'/api/services/{record.pk}/pay/',
                               json.dumps({'payment_method': 'cash'}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 400)
