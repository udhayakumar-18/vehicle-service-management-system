# Vehicle Service Management System

A full-stack web application for managing vehicle service operations, repairs, components, pricing, and revenue analytics.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 + Django REST Framework |
| Frontend | React 19 + Vite |
| Database | SQLite (default) |
| Charts | Recharts |
| Styling | Vanilla CSS (premium dark design) |

---

## Project Structure

```
Vehicle Service Management System/
├── backend/
│   ├── config/           # Django project settings & URLs
│   ├── core/
│   │   ├── models/       # Sub-models: component, vehicle, service
│   │   ├── views/        # Sub-views: component, vehicle, service, revenue
│   │   ├── forms/        # Sub-forms: component, vehicle, service
│   │   ├── serializers/  # DRF serializers
│   │   ├── tests/        # Unit tests: models, views, forms
│   │   ├── admin.py
│   │   └── urls.py
│   ├── manage.py
│   └── venv/
└── frontend/
    └── src/
        ├── api/          # Axios API calls (component, vehicle, service, revenue)
        ├── components/   # Sidebar, Modal, Toast, StatusBadge, ConfirmDialog
        └── pages/        # Dashboard, Components, Vehicles, Services, ServiceDetail, Revenue
```

---

## Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

---

### Backend Setup

```bash
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (already done, but if fresh clone:)
pip install django djangorestframework django-cors-headers

# Run migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Create a superuser for the Django admin
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

The Django API will be available at: **http://127.0.0.1:8000/api/**

Django Admin: **http://127.0.0.1:8000/admin/**

---

### Frontend Setup

```bash
cd frontend

# Install dependencies (already done, but if fresh clone:)
npm install

# Start dev server
npm run dev
```

The React app will be available at: **http://localhost:5173/**

> The Vite dev server proxies all `/api/` requests to Django automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/components/` | List / Register components |
| GET/PUT/DELETE | `/api/components/<id>/` | Component detail |
| GET/POST | `/api/vehicles/` | List / Register vehicles |
| GET/PUT/DELETE | `/api/vehicles/<id>/` | Vehicle detail |
| GET/POST | `/api/services/` | List / Create service records |
| GET/PUT/DELETE | `/api/services/<id>/` | Service record detail |
| GET/POST | `/api/services/<id>/issues/` | List / Add issues |
| PUT/DELETE | `/api/issues/<id>/` | Update / Remove issue |
| POST | `/api/services/<id>/pay/` | Simulate payment |
| GET | `/api/revenue/summary/` | Summary stats |
| GET | `/api/revenue/daily/?days=30` | Daily revenue |
| GET | `/api/revenue/monthly/?months=12` | Monthly revenue |
| GET | `/api/revenue/yearly/` | Yearly revenue |

---

## Running Unit Tests

```bash
cd backend
.\venv\Scripts\activate
python manage.py test core.tests
```

**30 tests** covering:
- `test_models.py` — Model creation, string representations, business logic (price calculation, stock checks)
- `test_views.py` — All REST API endpoints (CRUD, payment simulation, double-payment rejection)
- `test_forms.py` — Form validation (negative prices, missing required fields, license plate normalization)

---

## Features

- ✅ **Component Registration** — Register parts with repair & purchase pricing, track stock
- ✅ **Vehicle Management** — Register vehicles with owner information
- ✅ **Service Job Tracking** — Create service records linked to vehicles
- ✅ **Issue Management** — Add issues per service job, select components, choose repair/new
- ✅ **Auto Price Calculation** — Total auto-updates as issues are added/removed
- ✅ **Payment Simulation** — Simulate payment with method selection (Cash, Card, Bank Transfer)
- ✅ **Revenue Dashboard** — Interactive Daily, Monthly, and Yearly revenue charts (Recharts)
- ✅ **Unit Tests** — 30 tests across models, views, and forms
- ✅ **Django Admin** — Full admin interface for all models

---

## Screenshots

*[Include screenshots of: Dashboard, Component Registration, Service Detail, Revenue Charts]*
