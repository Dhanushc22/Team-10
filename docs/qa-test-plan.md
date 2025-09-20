# 🧪 QA Test Plan - Shiv Accounts

## 📋 Test Overview

This document outlines comprehensive testing procedures for the Shiv Accounts application, covering all major user flows, role-based access, and system integrations.

## 🎯 Test Objectives

- ✅ Verify role-based access control (Admin, Invoicing User, Contact User)
- ✅ Test all CRUD operations for master data and transactions
- ✅ Validate form submissions and error handling
- ✅ Ensure data consistency across frontend and backend
- ✅ Test authentication and authorization flows

## 👥 Test User Accounts

### Pre-configured Test Users

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin@gmail.com` | `admin123` | Admin | Full system access |
| `kakumaniakshar@gmail.com` | [Your password] | Invoicing User | Transactions + Master Data |
| `customer@demo.com` | `demo12345` | Contact | Own invoices only |
| `vendor@demo.com` | `demo12345` | Contact | Own bills only |

### Test Data Available

| Entity | ID | Name/Details |
|--------|----|--------------| 
| **Customer** | 1 | ABC Corporation (customer) |
| **Vendor** | 2 | XYZ Suppliers (vendor) |
| **Product** | 1 | Office Chair (₹5,000) |

## 🔐 Authentication & Authorization Tests

### AT-001: Login Flow
- **Steps**: 
  1. Visit `/login`
  2. Enter valid credentials for each user type
  3. Verify correct dashboard redirect
- **Expected**: 
  - Admin → `/dashboard`
  - Invoicing User → `/invoicing-dashboard`
  - Contact User → `/contact-dashboard`

### AT-002: Role-Based Route Protection
- **Steps**: Try accessing restricted routes with different user types
- **Expected**: Automatic redirects to appropriate dashboards

### AT-003: Token Authentication
- **Steps**: 
  1. Login and verify token storage
  2. Refresh page and verify persistent login
  3. Logout and verify token removal

## 📊 Master Data Tests

### MD-001: Contact Management (Admin/Invoicing Only)
- **Create Contact**:
  1. Navigate to Master Data → Contacts
  2. Click "New Contact"
  3. Fill: Name="Test Customer", Type="customer", Email="test@test.com"
  4. Save and verify in list
- **Edit/Delete**: Test update and delete operations

### MD-002: Product Management
- **Create Product**:
  1. Navigate to Master Data → Products  
  2. Click "New Product"
  3. Fill: Name="Test Product", Sales Price=1000, Tax=18%
  4. Save and verify

### MD-003: Tax & Chart of Accounts
- Test CRUD operations for Tax and Chart of Accounts

## 📋 Transaction Tests

### TR-001: Sales Order Creation
- **Test Data**: Customer ID=1, Product ID=1, Quantity=2, Unit Price=5000, Tax=18%
- **Steps**:
  1. Navigate to Transactions → Sales Orders
  2. Click "New Sales Order" 
  3. Fill Customer ID: `1`
  4. Add line item: Product ID=`1`, Quantity=`2`, Unit Price=`5000`, Tax=`18`
  5. Click "Save Sales Order"
- **Expected**: Success message, SO appears in list with calculated totals

### TR-002: Purchase Order Creation  
- **Test Data**: Vendor ID=2, Product ID=1, Quantity=3, Unit Price=4500, Tax=18%
- **Steps**: Similar to Sales Order but with vendor
- **Expected**: PO created with proper calculations

### TR-003: Invoice Creation
- **Test Data**: Customer ID=1, line items with products
- **Steps**:
  1. Navigate to Transactions → Customer Invoices
  2. Create new invoice with line items
  3. Verify tax calculations and totals
- **Expected**: Invoice created, totals calculated correctly

### TR-004: Payment Allocation
- **Steps**:
  1. Create invoices/bills
  2. Navigate to Payments
  3. Test Quick Pay functionality
  4. Test multi-allocation payment
- **Expected**: Payments allocated correctly, balance updates

### TR-005: Document Conversion
- **Steps**:
  1. Create Sales Order
  2. Click "Convert to Invoice"
  3. Verify invoice creation with same line items
- **Expected**: Invoice created from SO data

## 📈 Dashboard Tests

### DS-001: Admin Dashboard
- **Steps**: Login as admin, view dashboard
- **Expected**: 
  - KPI cards show calculated values
  - Charts display (mock data acceptable)
  - Pending transactions listed

### DS-002: Invoicing User Dashboard  
- **Steps**: Login as invoicing user
- **Expected**: Same data as admin dashboard

### DS-003: Contact User Dashboard
- **Steps**: Login as contact user
- **Expected**: Only personal invoice/bill data displayed

## 📊 Reports Tests

### RP-001: Balance Sheet
- **Steps**: 
  1. Navigate to Reports → Balance Sheet
  2. Test date filter
  3. Verify account listings and totals
- **Expected**: Structured balance sheet with assets/liabilities

### RP-002: Profit & Loss
- **Steps**: Test P&L report with date range filters
- **Expected**: Income and expense breakdown

### RP-003: Stock Report
- **Steps**: View stock report
- **Expected**: Product quantities and stock values

## 🛡️ Security Tests

### SC-001: Cross-Role Access
- **Steps**: Attempt to access admin features as contact user
- **Expected**: Blocked access, appropriate redirects

### SC-002: API Authorization
- **Steps**: Test API calls without token
- **Expected**: 401/403 responses

### SC-003: Data Isolation
- **Steps**: Verify contact users see only their own data
- **Expected**: No access to other users' transactions

## 🔧 Error Handling Tests

### EH-001: Form Validation
- **Steps**: Submit forms with missing/invalid data
- **Expected**: Clear validation messages, no data corruption

### EH-002: Network Errors
- **Steps**: Test with backend down
- **Expected**: Graceful error messages, no crashes

### EH-003: Invalid Data
- **Steps**: Submit malformed data
- **Expected**: Backend validation, appropriate error responses

## 🚀 Performance Tests

### PF-001: Page Load Times
- **Target**: All pages load under 2 seconds
- **Steps**: Navigate through all major pages
- **Expected**: Fast loading, responsive UI

### PF-002: Data Fetching
- **Steps**: Test with multiple records
- **Expected**: Efficient pagination, no memory leaks

## ✅ Test Execution Checklist

### Pre-Testing Setup
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000  
- [ ] Database populated with test data
- [ ] All test user accounts available

### Test Execution
- [ ] Authentication & Authorization (AT-001 to AT-003)
- [ ] Master Data Operations (MD-001 to MD-003)
- [ ] Transaction Processing (TR-001 to TR-005)
- [ ] Dashboard Functionality (DS-001 to DS-003)
- [ ] Reports Generation (RP-001 to RP-003)
- [ ] Security Controls (SC-001 to SC-003)
- [ ] Error Handling (EH-001 to EH-003)
- [ ] Performance Validation (PF-001 to PF-002)

### Post-Testing
- [ ] Document any bugs found
- [ ] Verify critical user flows work end-to-end
- [ ] Confirm data integrity maintained
- [ ] Sign-off on testing completion

## 🐛 Bug Reporting Template

```
**Bug ID**: BUG-001
**Priority**: High/Medium/Low
**Environment**: Development/Staging/Production
**User Role**: Admin/Invoicing/Contact
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Screenshots**: [Attach if applicable]
**Browser/OS**: Chrome/Firefox/etc.
```

## 📝 Test Results Summary

| Test Category | Total Tests | Passed | Failed | Notes |
|---------------|-------------|--------|--------|-------|
| Authentication | 3 | - | - | - |
| Master Data | 3 | - | - | - |
| Transactions | 5 | - | - | - |
| Dashboard | 3 | - | - | - |
| Reports | 3 | - | - | - |
| Security | 3 | - | - | - |
| Error Handling | 3 | - | - | - |
| Performance | 2 | - | - | - |
| **TOTAL** | **25** | **-** | **-** | **-** |

---

*This test plan ensures comprehensive coverage of all system functionality and user scenarios.*
