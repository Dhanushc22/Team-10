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

#### Role-Based Access Control (RBAC)
The system implements comprehensive role-based access control with three distinct user types:

**1. 👑 Admin (Business Owner)**
- **Level of Access**: Full access (superuser)
- **Django Admin Access**: ✅ Full access
- **Permissions**: All 96 permissions
- **What they can do**:
  - Create, modify, or archive all master data (Contacts, Products, Taxes, Chart of Accounts)
  - Record all types of transactions (PO, SO, Vendor Bills, Invoices, Payments)
  - View all reports (Balance Sheet, Profit & Loss, Stock Report, Partner Ledger)
  - Manage user roles (create Invoicing User accounts, deactivate them)
  - Export reports (Excel/PDF)
- **What they cannot do**: Nothing is restricted

**2. 📝 Invoicing User (Accountant)**
- **Level of Access**: Transaction + Master Data (but limited)
- **Django Admin Access**: ✅ Limited access
- **Permissions**: 63 permissions (Master Data + Transactions)
- **What they can do**:
  - Create master data (Contacts, Products, Taxes, Chart of Accounts)
  - Record transactions: Purchase Orders, Vendor Bills, Sales Orders, Customer Invoices, Payments
  - View reports: Balance Sheet, P&L, Stock Report
  - Download reports for accounting purposes
- **What they cannot do**:
  - Modify Admin-only settings (e.g., cannot delete/archive existing Chart of Accounts)
  - Cannot manage other users
  - Cannot view reports unrelated to their role

**3. 👤 Contact User (Customer or Vendor)**
- **Level of Access**: Restricted (own data only)
- **Django Admin Access**: ❌ No access
- **Permissions**: 3 permissions (View own data only)
- **What they can do**:
  - View only their own invoices or bills
  - Customer → sees sales invoices issued to them
  - Vendor → sees purchase orders/bills issued to them
  - Make payments against their invoices (Cash/Bank/UPI link)
  - Download their invoices/bills in PDF
- **What they cannot do**:
  - Cannot access master data (Contacts, Products, Taxes, CoA)
  - Cannot view or edit other users' invoices
  - Cannot access financial reports (Balance Sheet, P&L, Stock)

**4. ⚙️ System (Automated Role)**
- **Level of Access**: Invisible backend actor
- **What it does**:
  - Validates data consistency (e.g., correct tax % against HSN code)
  - Computes taxes during transactions automatically
  - Updates stock ledgers and financial ledgers in real time
  - Generates financial reports (Balance Sheet, P&L, Stock) on demand
- **What it cannot do**: It does not initiate transactions — only processes what users input

#### User Model
`accounts.models.User` extends `AbstractUser`:
- Login by email (`USERNAME_FIELD='email'`), email is unique.
- Fields: `mobile`, `role` (admin|invoicing_user|contact), `profile_image`, `is_verified`, timestamps.
- Groups: Users are automatically assigned to appropriate Django groups based on their role.

### Test User Accounts

#### Pre-configured User Accounts for Testing

**1. 👑 Admin User (Business Owner)**
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Access**: Full Django admin + React app access
- **Use Case**: Complete system management and testing

**2. 📝 Invoicing User (Accountant)**
- **Email**: `kakumaniakshar@gmail.com`
- **Password**: [Your existing password]
- **Role**: `invoicing_user`
- **Access**: Limited Django admin + React app access
- **Use Case**: Day-to-day accounting operations

**3. 👤 Demo Customer User**
- **Email**: `customer@demo.com`
- **Password**: `demo12345`
- **Role**: `contact`
- **Access**: React app only (no Django admin)
- **Use Case**: Customer portal testing

**4. 👤 Demo Vendor User**
- **Email**: `vendor@demo.com`
- **Password**: `demo12345`
- **Role**: `contact`
- **Access**: React app only (no Django admin)
- **Use Case**: Vendor portal testing

#### Access URLs
- **Django Admin**: http://localhost:8000/admin/
- **React Application**: http://localhost:3000/
- **API Base URL**: http://localhost:8000/api/

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
  - Product Master: CRUD products/services with pricing and taxes (HSN, category)
  - Tax Master: CRUD taxes (percentage/fixed, applicable on sales/purchase/both)
  - Chart of Accounts: CRUD ledger accounts (types: asset/liability/income/expense/equity)
- Transactions
  - Purchase Orders → Convert to Vendor Bills (AP) [POST /api/transactions/purchase-orders/:id/convert-to-bill/]
  - Sales Orders → Convert to Customer Invoices (AR) [POST /api/transactions/sales-orders/:id/convert-to-invoice/]
  - Payments: Record/allocate payments; Quick Allocate API for invoice/bill settlement
- Reports
  - Balance Sheet, Profit & Loss
  - Stock Report, Partner Ledger
- Dashboard
  - Invoicing Dashboard (invoicing users): KPIs, pending lists with Quick Pay
  - Contact Dashboard (contact users): Own invoices/bills overview

### Backend API (high‑level)
Mounted under `/api/` (see `backend/shiv_accounts/urls.py`).
- Auth (`/api/auth/`): register, login, logout, profile, update profile, change password, dashboard data
- Master Data (`/api/master-data/`): contacts, products, taxes, chart of accounts (CRUD)
- Transactions (`/api/transactions/`): purchase orders, vendor bills, sales orders, customer invoices, payments; contact‑scoped endpoints; conversions and quick payments
  - `POST /api/transactions/sales-orders/:id/convert-to-invoice/`
  - `POST /api/transactions/purchase-orders/:id/convert-to-bill/`
  - `POST /api/transactions/payments/quick-allocate/` { target_type: 'invoice'|'bill', target_id, amount, payment_method }
- Reports (`/api/reports/`): balance sheet, profit & loss, stock, partner ledger, dashboard summary

### Frontend Routes (primary)
- Public: `/login` (login + sign‑up toggle)
- Protected: `/dashboard`, `/invoicing-dashboard`, `/contact-dashboard`, `/profile`, `/master-data/*`, `/transactions/*`, `/reports/*`, `/admin/users`
- Route protection via `components/ProtectedRoute` and `AuthContext`

### Forms, Validation, UX
- React Hook Form for client‑side validation
- DRF serializers validate and return consistent error messages
- Toast notifications for success/errors
- Tailwind CSS for responsive UI and common components

### State & Data Fetching
- React Query manages server state, caching, and loading/error states
- AuthContext holds `user` and `token`; redirects unauthenticated users to `/login`

### Django Admin Interface

#### Database Management
The Django admin interface provides comprehensive database management capabilities:

**Access**: http://localhost:8000/admin/

**Available Sections**:
- **Users**: Manage user accounts, roles, and group assignments
- **Groups**: View and manage permission groups (Admin, Invoicing User, Contact User)
- **Master Data**:
  - Contacts: Customer and vendor management
  - Products: Product/service catalog with pricing and tax information
  - Taxes: Tax rate configurations
  - Chart of Accounts: Financial ledger structure
- **Transactions**:
  - Purchase Orders: Vendor purchase order management
  - Vendor Bills: Accounts payable management
  - Sales Orders: Customer sales order management
  - Customer Invoices: Accounts receivable management
  - Payments: Payment recording and tracking
- **Auth Tokens**: API authentication token management

**Admin Features**:
- Custom list displays with filtering and search
- Date hierarchies for transaction views
- Group-based permission enforcement
- User-friendly interface with role-based access control

#### Sample Data
The system includes pre-configured sample data:
- **Contacts**: ABC Corporation (customer), XYZ Suppliers (vendor)
- **Products**: Office Chair with pricing and tax information
- **Taxes**: GST 18% configuration
- **Chart of Accounts**: Cash Account with opening balance

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

### Recent Updates & Improvements

#### Role-Based Access Control Implementation
- **Django Groups**: Created 3 permission groups with specific access levels
- **Admin Group**: 96 permissions (full system access)
- **Invoicing User Group**: 63 permissions (master data + transactions)
- **Contact User Group**: 3 permissions (view own data only)
- **Automatic Assignment**: Users are automatically assigned to groups based on their role

#### Django Admin Enhancements
- **Custom Admin Configurations**: Enhanced admin interface for all models
- **User Management**: Improved user admin with group assignments and role display
- **Master Data Admin**: Custom list displays, filters, and search for contacts, products, taxes, and chart of accounts
- **Transaction Admin**: Date hierarchies and comprehensive transaction management
- **Permission Management**: Visual group and permission management interface

#### Database Security
- **Group-Based Permissions**: Comprehensive permission system preventing unauthorized access
- **Role Enforcement**: Automatic permission assignment based on user roles
- **Admin Access Control**: Different admin access levels for different user types
- **Sample Data**: Pre-configured test data for demonstration and testing

#### Configuration Improvements
- **Local Development Setup**: Removed Docker dependencies for simplified local development
- **Environment Configuration**: Hardcoded settings for local development (no external dependencies)
- **CORS Configuration**: Properly configured for React frontend communication
- **Database Configuration**: SQLite setup for local development

### Known Limitations
- Some dashboard stats are mocked/simplified
- No comprehensive automated tests yet
- Minimal file storage configuration
- Passwords are stored as hashes (cannot retrieve original passwords)

### Future Enhancements
- Stronger role‑based UI gating and permissions in React frontend
- Richer reporting with proper aggregations
- Image/file storage service
- Test coverage (unit/integration/e2e)
- More robust auth/session handling
- Password reset functionality
- Email notifications for transactions

### Testing Guide

#### Quick Start Testing
1. **Start the servers**:
   - Backend: `python manage.py runserver` (http://localhost:8000)
   - Frontend: `npm start` (http://localhost:3000)

2. **Test Django Admin Access**:
   - Go to http://localhost:8000/admin/
   - Try logging in with different user accounts
   - Observe different access levels and permissions

3. **Test React App Access**:
   - Go to http://localhost:3000/
   - Login with different user accounts
   - Test role-based functionality

#### Permission Testing Checklist
- [ ] Admin can access all Django admin sections
- [ ] Invoicing User has limited Django admin access
- [ ] Contact Users cannot access Django admin
- [ ] All users can access React app (with role-based features)
- [ ] Groups and permissions are properly assigned
- [ ] Sample data is visible in Django admin

### Glossary
- **Contact**: Customer/Vendor entity
- **COA**: Chart of Accounts (ledger structure)
- **PO/SO**: Purchase/Sales Order
- **AP/AR**: Accounts Payable/Receivable
- **RBAC**: Role-Based Access Control
- **Django Admin**: Built-in Django administration interface for database management

### Appendix: Business Requirements (Provided Spec)

#### 1) Overview
- Cloud-based accounting system for Shiv Furniture to:
  - Maintain core master data: Contacts, Products, Taxes, Chart of Accounts (CoA)
  - Record sales, purchases, and payments using master data
  - Generate reports: Balance Sheet, Profit & Loss (P&L), Stock Statement

#### 2) Primary Actors
- **Admin (Business Owner)**: Create/modify/archive master data, record transactions, view reports
- **Invoicing User (Accountant)**: Create master data, record transactions, view reports
- **Contact (Customer/Vendor)**: Created via Contact Master; can view their own invoices/bills and make payments
- **System**: Validates data, computes taxes, updates ledgers, generates reports

#### 3) Master Data Modules
- **Contact Master**
  - Fields: Name, Type (Customer/Vendor/Both), Email, Mobile, Address (City, State, Pincode), Profile Image
  - Examples: Vendor: Azure Furniture; Customer: Nimesh Pathak
- **Product Master**
  - Fields: Product Name, Type (Goods/Service), Sales Price, Purchase Price, Sale Tax %, Purchase Tax %, HSN Code, Category
  - Examples: Office Chair, Wooden Table, Sofa, Dining Table
- **Tax Master**
  - Fields: Tax Name, Computation Method (Percentage/Fixed Value), Applicable on Sales/Purchase
  - Examples: GST 5%, GST 10%
- **Chart of Accounts (CoA)**
  - Concept: Master list of ledger accounts (Assets, Liabilities, Income, Expenses, Equity) to classify every transaction
  - Fields: Account Name, Type (Asset, Liability, Expense, Income, Equity)
  - Examples:
    - Assets: Cash, Bank, Debtors
    - Liabilities: Creditors
    - Income: Sales Income
    - Expenses: Purchase Expense

#### 4) Transaction Flow (using master data)
- **Purchase Order (PO)**: Select Vendor, Product, Quantity, Unit Price, Tax (5%/10%)
- **Vendor Bill**: Convert PO to Bill; record invoice date, due date; register payment (Cash/Bank)
- **Sales Order (SO)**: Select Customer, Product, Quantity, Unit Price, Tax
- **Customer Invoice**: Generate from SO; set tax; receive payment via Cash/Bank
- **Payment**: Register against bill/invoice; select bank or cash

#### 5) Reporting Requirements
- **Balance Sheet**: Real-time snapshot of Assets, Liabilities, Equity
- **Profit & Loss**: Income from sales minus purchases/expenses → net profit
- **Stock Report**: Current quantity, valuation, movement (e.g., Office Chair stock level)

#### 6) Key Use-Case Steps
- 6.1 Create Master Data
  1) Create Users
  2) Add Contacts (e.g., Azure Furniture, Nimesh Pathak)
  3) Add Products (e.g., Wooden Chair with 5% sales tax)
  4) Define Tax rates (5%, 10%)
  5) Set up Chart of Accounts
- 6.2 Record Purchase
  1) Create PO for Azure Furniture
  2) Convert PO to Vendor Bill upon receipt
  3) Record payment via Bank
- 6.3 Record Sale
  1) Create SO for Nimesh Pathak (e.g., 5 Office Chairs)
  2) Generate Customer Invoice
  3) Record payment via Cash/Bank
- 6.4 Generate Reports
  1) Select period
  2) System compiles: Balance Sheet, P&L, Stock report (Purchased +, Sales −, Available)

#### Key Concepts (Quick Reference)
- **Chart of Accounts (CoA)**: Structured list of ledger accounts (Cash, Bank, AR, Sales Revenue, Purchases, etc.)
- **Profit & Loss (P&L)**: Income statement over a period
- **Sales Order (SO)**: Confirms customer order before delivery/invoicing
- **Purchase Order (PO)**: Official request to vendor to supply goods/services
- **Vendor Bill**: Purchase invoice received (AP tracking)
- **HSN**: Goods classification code for tax/rates standardization
- **Balance Sheet**: Assets = Liabilities + Equity snapshot at a date
- **Partner Ledger**: Per customer/vendor transaction history (invoices, payments, credit notes)

#### API Documentation
- Link: https://drive.google.com/file/d/1zeyV15pIQekxdDXn3p9pmssCvaQUMEBe/view?usp=sharing

#### Why this Hackathon Problem is Important
- Learn real-world ERP workflows and module interactions (e.g., Sales → Inventory)
- Practice translating business logic into working software
