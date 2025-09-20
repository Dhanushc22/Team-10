## Shiv Accounts Cloud – Project Documentation

### Overview
Shiv Accounts Cloud is a full‑stack accounting prototype for small businesses to manage master data, record transactions, and generate core financial/stock reports. It includes role‑based access (Admin, Invoicing User, Contact) and a modern UX in React backed by a Django REST API.

- Status: Local prototype (no Docker)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Goal: Demonstrate end‑to‑end flows across masters, transactions, and reports with a clean UI and token‑based auth.

### Technology Stack
- Frontend
  - React 18
  - React Router (routing)
  - React Query (data fetching + caching)
  - React Hook Form (forms)
  - Tailwind CSS (styling)
  - Lucide React (icons)
  - Recharts (charts)
- Backend
  - Django 4.2.7
  - Django REST Framework (API)
  - SQLite (local dev DB)
  - CORS Headers, django-filter
  - Pillow (images)
- Tooling
  - Node.js (npm)
  - Python venv

### Architecture
- React SPA communicates with Django REST API over JSON.
- Auth uses DRF Token Authentication; token stored in localStorage and sent as `Authorization: Token <token>`.
- Django apps: `accounts`, `master_data`, `transactions`, `reports`.

### Environment & Configuration
- Frontend base URL: `REACT_APP_API_URL` (defaults to `http://localhost:8000/api`)
- Backend CORS allows `http://localhost:3000` and `http://127.0.0.1:3000`
- Backend DB: SQLite (auto‑created)
- Example backend env: `backend/env.example`

### File / Directory Structure
```
Team-10/
├── backend/
│   ├── shiv_accounts/              # Django project settings, URLs
│   │   ├── settings.py             # DEBUG=True, SQLite, CORS, AUTH_USER_MODEL
│   │   └── urls.py                 # Mounts /api/* routes
│   ├── accounts/                   # Auth + user management
│   │   ├── models.py               # Custom User (email as username, role)
│   │   ├── serializers.py          # User, Registration, Login, ChangePassword
│   │   ├── views.py                # register, login, logout, profile, dashboard
│   │   └── urls.py                 # /api/auth/* endpoints
│   ├── master_data/                # Contacts, Products, Taxes, Chart of Accounts
│   ├── transactions/               # POs, Vendor Bills, SOs, Invoices, Payments
│   ├── reports/                    # Balance Sheet, P&L, Stock, Partner Ledger
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Routes
│   │   ├── contexts/AuthContext.js # Auth state + API integration
│   │   ├── services/api.js         # Axios instance + API functions
│   │   ├── components/             # Layout, Header, Sidebar, ProtectedRoute
│   │   └── pages/                  # Login, Dashboard, master-data, etc.
│   └── package.json
├── README.md
└── project document.md             # This document
```

### User Roles & Permissions
- Admin: Full access to masters, transactions, reports; manage users.
- Invoicing User: Create/modify master data; record transactions; view reports.
- Contact: View own invoices/bills and make payments.

`accounts.models.User` extends `AbstractUser`:
- Login by email (`USERNAME_FIELD='email'`), email is unique.
- Fields: `mobile`, `role` (admin|invoicing_user|contact), `profile_image`, `is_verified`, timestamps.

### Authentication Flow
- Register: `POST /api/auth/register/` → `{ user, token }`
- Login: `POST /api/auth/login/` → `{ user, token }`
- Profile: `GET /api/auth/profile/`
- Update Profile: `PUT /api/auth/profile/update/`
- Change Password: `POST /api/auth/change-password/`
- Logout: `POST /api/auth/logout/`
- Frontend stores token in localStorage and adds header automatically via `services/api.js`.

### Working Modules & Functionalities
- Master Data
  - Contact Master: CRUD customers/vendors
  - Product Master: CRUD products/services with pricing and taxes
  - Tax Master: Manage GST/tax rates
  - Chart of Accounts: Define ledger accounts
- Transactions
  - Purchase Orders → Vendor Bills (AP)
  - Sales Orders → Customer Invoices (AR)
  - Payments: Record customer/vendor payments
- Reports
  - Balance Sheet, Profit & Loss
  - Stock Report, Partner Ledger
- Dashboard
  - Role‑based metrics and quick stats for admin/invoicing users and contact users

### Backend API (high‑level)
Mounted under `/api/` (see `backend/shiv_accounts/urls.py`).
- Auth (`/api/auth/`): register, login, logout, profile, update profile, change password, dashboard data
- Master Data (`/api/master-data/`): contacts, products, taxes, chart of accounts (CRUD)
- Transactions (`/api/transactions/`): purchase orders, vendor bills, sales orders, customer invoices, payments; contact‑scoped endpoints
- Reports (`/api/reports/`): balance sheet, profit & loss, stock, partner ledger, dashboard summary

### Frontend Routes (primary)
- Public: `/login` (login + sign‑up toggle)
- Protected: `/dashboard`, `/master-data/*`, `/transactions/*`, `/reports/*`
- Route protection via `components/ProtectedRoute` and `AuthContext`

### Forms, Validation, UX
- React Hook Form for client‑side validation
- DRF serializers validate and return consistent error messages
- Toast notifications for success/errors
- Tailwind CSS for responsive UI and common components

### State & Data Fetching
- React Query manages server state, caching, and loading/error states
- AuthContext holds `user` and `token`; redirects unauthenticated users to `/login`

### Local Setup (reference)
- Backend (Windows PowerShell)
  - `cd backend`
  - `python -m venv venv`
  - `./venv/Scripts/activate`
  - `pip install -r requirements.txt`
  - `python manage.py makemigrations && python manage.py migrate`
  - Optional superuser: `python manage.py createsuperuser`
  - Run: `python manage.py runserver` (http://localhost:8000)
- Frontend
  - `cd frontend`
  - `npm install`
  - `npm start` (http://localhost:3000)

### Conventions
- Backend
  - Domain‑oriented Django apps
  - DRF pagination and filters where relevant
  - Default permission is authenticated; Token and Session auth enabled
- Frontend
  - Functional components + hooks; API isolated in `services/api.js`
  - Routing in `App.js`; protected routes
  - Tailwind utility classes for styling

### Error Handling
- 401: token cleared and redirect to `/login`
- Validation errors surfaced in forms and toasts
- React Query handles request errors and loading states

### Security Notes (prototype)
- Token in localStorage (simple for prototype; consider HttpOnly cookies for prod)
- CORS restricted to localhost origins
- DEBUG=True for local only

### Known Limitations
- Some dashboard stats are mocked/simplified
- No comprehensive automated tests yet
- Minimal file storage configuration

### Future Enhancements
- Stronger role‑based UI gating and permissions
- Richer reporting with proper aggregations
- Image/file storage service
- Test coverage (unit/integration/e2e)
- More robust auth/session handling

### Glossary
- Contact: Customer/Vendor entity
- COA: Chart of Accounts (ledger structure)
- PO/SO: Purchase/Sales Order
- AP/AR: Accounts Payable/Receivable
