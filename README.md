# Shiv Accounts Cloud

A comprehensive cloud-based accounting system for Shiv Furniture that enables entry of core master data, smooth recording of sales, purchases, and payments, and automated generation of financial and stock reports.

## Features

### Master Data Management
- **Contact Master**: Manage customers and vendors with complete contact information
- **Product Master**: Handle products and services with pricing and tax information
- **Tax Master**: Define GST rates and tax configurations
- **Chart of Accounts**: Set up ledger accounts for proper financial reporting

### Transaction Management
- **Purchase Orders**: Create and manage purchase orders for vendors
- **Vendor Bills**: Convert purchase orders to bills and track payments
- **Sales Orders**: Create and manage sales orders for customers
- **Customer Invoices**: Generate invoices from sales orders
- **Payments**: Record payments for both customers and vendors

### Reporting System
- **Balance Sheet**: Real-time snapshot of assets, liabilities, and equity
- **Profit & Loss**: Income and expense tracking with net profit calculation
- **Stock Report**: Inventory levels and stock movement tracking
- **Partner Ledger**: Detailed transaction history with customers and vendors

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

## Support

For support and questions, please contact the development team.

---

**Shiv Accounts Cloud** - Streamlining accounting for modern businesses.
