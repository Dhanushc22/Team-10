# Shiv Accounts Cloud

A comprehensive cloud-based accounting system for Shiv Furniture that enables entry of core master data, smooth recording of sales, purchases, and payments, and automated generation of financial and stock reports. 

## Features

### Master Data Management
- **Contact Management**: 
  - Customer and vendor profiles with comprehensive contact information
  - GST registration number tracking and validation
  - Profile image uploads and contact categorization
  - Address management with city, state, and pincode
  - User-linked contacts for role-based access
  - Active/inactive status management
  
- **Product Catalog**: 
  - Goods and services classification with type management
  - HSN code integration with automatic GST rate lookup
  - Separate sales and purchase pricing with tax configuration
  - Product categorization and detailed descriptions
  - Active/inactive product status tracking
  - Purchase and sale tax percentage configuration
  
- **Tax Management**: 
  - GST and custom tax configurations with flexible computation methods
  - Percentage-based and fixed-value tax calculations
  - Sales, purchase, or both applicable tax settings
  - Comprehensive tax descriptions and active status management
  
- **Chart of Accounts**: 
  - Complete hierarchical accounting structure with parent-child relationships
  - Asset, liability, expense, income, and equity account types
  - Account codes for systematic organization
  - Opening and current balance tracking
  - Full account name hierarchy generation

- **HSN Search Integration**:
  - Real-time HSN code lookup via Government GST API (proxied by backend)
  - Transformed response to `{ hsn_code, description, gst_rate }`
  - Search by HSN code, product description, or service type
  - Input validation (min 3 chars) to meet GST API requirements
  - Optional mock fallback for dev scenarios
  - See `docs/hsn-api-integration.md` for details

### Transaction Management
- **Purchase Orders**: 
  - Complete purchase order lifecycle management
  - Vendor selection with automatic contact integration
  - Line item management with product, quantity, and pricing
  - Tax calculations with HSN-based rate application
  - Order status tracking (draft, sent, received, cancelled)
  - Payment status integration with conditional payment buttons
  - Automatic subtotal, tax, and grand total calculations
  
- **Vendor Bills**: 
  - Purchase order linked bill generation
  - Due date management and status tracking
  - Automatic payment status calculation (pending, paid, overdue)
  - Balance due calculations with paid amount tracking
  - Bill approval workflow and vendor payment processing
  
- **Sales Orders**: 
  - Customer order management with delivery date tracking
  - Product line items with tax calculations
  - Order status management (draft, confirmed, delivered, cancelled)
  - Payment tracking integration with customer invoice linking
  - Payment status monitoring with conditional payment buttons
  
- **Customer Invoices**: 
  - Sales order to invoice conversion
  - Customer payment tracking with balance due calculations
  - Invoice status management (pending, paid, overdue, cancelled)
  - Reference number tracking and detailed invoice generation
  
- **Payments System**: 
  - Unified payment processing for both customers and vendors
  - Multiple payment methods (cash, bank, cheque, online)
  - Payment allocation to specific invoices and bills
  - Auto-generated payment numbers with timestamp integration
  - Payment type categorization (customer payment, vendor payment)
  - Comprehensive payment history and reference tracking

### Reporting & Analytics
- **Dashboard Analytics**: 
  - Real-time financial metrics with auto-refresh
  - Sales and purchase trend visualization using Recharts
  - Key performance indicators (KPIs) tracking
  - Cash flow monitoring and net profit calculations
  - Recent transaction summaries and alerts
  
- **Balance Sheet**: 
  - Dynamic financial position reporting with date selection
  - Asset, liability, and equity calculations from live transaction data
  - Cash position tracking with receivables and payables
  - Automatic balance calculations with real-time updates
  
- **Profit & Loss**: 
  - Comprehensive income and expense reporting
  - Period-based P&L generation with date range selection
  - Revenue recognition from customer invoices
  - Cost tracking from vendor bills and purchases
  - Net profit/loss calculations with variance analysis
  
- **Stock Reports**: 
  - Inventory movement tracking and stock balance monitoring
  - Product-wise stock analysis with movement history
  - Stock valuation and quantity tracking
  - Low stock alerts and reorder point management
  
- **Partner Ledger**: 
  - Individual customer and vendor transaction history
  - Running balance calculations with opening/closing balances
  - Period-wise transaction filtering with detailed drill-down
  - Debit/credit transaction categorization
  - Account reconciliation support with transaction references

### User Management
- **Admin**: Full access to all features including master data management
- **Invoicing User**: Can create master data, record transactions, and view reports
- **Contact Users**: Can view their own invoices/bills and make payments

## Technology Stack

### Backend
- **Django 4.2.7**: Python web framework
- **Django REST Framework**: API development
- **SQLite**: Database (can be easily switched to PostgreSQL/MySQL)
- **Django CORS Headers**: Cross-origin resource sharing
- **Pillow**: Image processing for profile pictures

### Frontend
- **React 18**: Modern JavaScript library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Recharts**: Data visualization

## Project Structure

```
shiv-accounts-cloud/
├── backend/                 # Django backend
│   ├── shiv_accounts/      # Main Django project
│   ├── accounts/           # User management app
│   ├── master_data/        # Master data management
│   ├── transactions/       # Transaction management
│   ├── reports/           # Reporting system
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json       # Node.js dependencies
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

4. **Environment variables** (optional but recommended):
   - Create a `.env` in `frontend/` or copy `env.example`:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```
   The frontend picks this up for API requests.

## API Documentation

The API follows RESTful conventions and includes:

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update user profile

### Master Data Endpoints
- `GET /api/master-data/contacts/` - List contacts
- `POST /api/master-data/contacts/` - Create contact
- `GET /api/master-data/products/` - List products
- `POST /api/master-data/products/` - Create product
- And more...

#### HSN Search (GST API Proxy)
- `GET /api/master-data/hsn-search/` - Search HSN codes
  - Query: `inputText`, `selectedType` = `byCode|byDesc`, `category` = `P|S|null`
  - Auth required: `Authorization: Token <token>`
  - Response: list of `{ hsn_code, description, gst_rate }`
  - See `docs/hsn-api-integration.md`

### Transaction Endpoints
- `GET /api/transactions/purchase-orders/` - List purchase orders
- `POST /api/transactions/purchase-orders/` - Create purchase order
- `GET /api/transactions/customer-invoices/` - List customer invoices
- And more...

### Report Endpoints
- `GET /api/reports/balance-sheet/` - Generate balance sheet
- `GET /api/reports/profit-loss/` - Generate P&L report
- `GET /api/reports/stock-report/` - Generate stock report
- And more...

## Usage

### Getting Started

1. **Access the application** at `http://localhost:3000`
2. **Register a new account** or use the superuser account
3. **Set up master data**:
   - Add contacts (customers/vendors)
   - Add products with pricing
   - Configure tax rates
   - Set up chart of accounts

4. **Record transactions**:
   - Create purchase orders
   - Convert to vendor bills
   - Create sales orders
   - Generate customer invoices
   - Record payments

5. **Generate reports**:
   - View balance sheet
   - Check profit & loss
   - Monitor stock levels
   - Review partner ledgers

### User Roles

#### Admin
- Full access to all features
- Can create, modify, and archive master data
- Can record all types of transactions
- Can view all reports
- Can manage user accounts

#### Invoicing User
- Can create master data
- Can record transactions
- Can view reports
- Cannot modify archived master data

#### Contact User
- Can view their own invoices/bills
- Can make payments
- Limited access to their own data only

## Development

### Adding New Features

1. **Backend**: Add models, serializers, views, and URLs in the appropriate Django app
2. **Frontend**: Create components and pages in the React frontend
3. **API Integration**: Update the API service files to include new endpoints

### Database Migrations

When making model changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Code Style

- **Backend**: Follow PEP 8 and Django best practices
- **Frontend**: Use ESLint and Prettier for code formatting
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utility classes

## Deployment

### Production Setup (reference)

1. **Environment Variables**: Set up production environment variables
2. **Database**: Use PostgreSQL or MySQL for production
3. **Static Files**: Configure static file serving
4. **Security**: Enable HTTPS and security headers
5. **Monitoring**: Set up logging and monitoring

Note: This project is currently intended to run locally as a prototype. Docker instructions have been removed. Use the local setup steps above for running the backend (Django) and frontend (React) on your machine.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## VIDEO DEMO
https://drive.google.com/drive/folders/1PTcpEGRaN_Wj4bZfJ3SL1F4yv9Jt-YBG?usp=drive_link
For support and questions, please contact the development team.

---

**Shiv Accounts Cloud** - Streamlining accounting for modern businesses.
