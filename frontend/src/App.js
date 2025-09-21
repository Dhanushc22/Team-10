import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { setQueryClient } from './services/enhancedAPI';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoicingDashboard from './pages/InvoicingDashboard';
import ContactMaster from './pages/master-data/ContactMaster';
import ProductMaster from './pages/master-data/ProductMaster';
import ChartOfAccounts from './pages/master-data/ChartOfAccounts';
import PurchaseOrder from './pages/transactions/PurchaseOrder';
import PurchaseOrderDetail from './pages/transactions/PurchaseOrderDetail';
import VendorBill from './pages/transactions/VendorBill';
import VendorBillDetail from './pages/transactions/VendorBillDetail';
import SalesOrder from './pages/transactions/SalesOrder';
import SalesOrderDetail from './pages/transactions/SalesOrderDetail';
import CustomerInvoice from './pages/transactions/CustomerInvoice';
import Payments from './pages/transactions/Payments';
import BalanceSheet from './pages/reports/BalanceSheet';
import ProfitLoss from './pages/reports/ProfitLoss';
import StockReport from './pages/reports/StockReport';
import PartnerLedger from './pages/reports/PartnerLedger';
import ContactDashboard from './pages/ContactDashboard';
import UserManagement from './pages/admin/UserManagement';
import Profile from './pages/Profile';
import InvoiceDetail from './pages/transactions/InvoiceDetail';
import HSNSearchDemo from './pages/HSNSearchDemo';
import HSNAPITest from './pages/HSNAPITest';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Set up global query client for real-time cache invalidation
  useEffect(() => {
    setQueryClient(queryClient);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Admin and Invoicing User Routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="invoicing-dashboard" element={<InvoicingDashboard />} />
                <Route path="profile" element={<Profile />} />
                
                {/* Master Data Routes */}
                <Route path="master-data/contacts" element={<ContactMaster />} />
                <Route path="master-data/products" element={<ProductMaster />} />
                <Route path="master-data/chart-of-accounts" element={<ChartOfAccounts />} />
                
                {/* Transaction Routes */}
                <Route path="transactions/purchase-orders" element={<PurchaseOrder />} />
                <Route path="transactions/purchase-orders/:id" element={<PurchaseOrderDetail />} />
                <Route path="transactions/vendor-bills" element={<VendorBill />} />
                <Route path="transactions/vendor-bills/:id" element={<VendorBillDetail />} />
                <Route path="transactions/sales-orders" element={<SalesOrder />} />
                <Route path="transactions/sales-orders/:id" element={<SalesOrderDetail />} />
                <Route path="transactions/customer-invoices" element={<CustomerInvoice />} />
                <Route path="transactions/customer-invoices/:id" element={<InvoiceDetail />} />
                <Route path="transactions/payments" element={<Payments />} />
                
                {/* Report Routes */}
                <Route path="reports/balance-sheet" element={<BalanceSheet />} />
                <Route path="reports/profit-loss" element={<ProfitLoss />} />
                <Route path="reports/stock-report" element={<StockReport />} />
                <Route path="reports/partner-ledger" element={<PartnerLedger />} />
                
                {/* Utilities */}
                <Route path="utilities/hsn-search" element={<HSNSearchDemo />} />
                <Route path="utilities/hsn-api-test" element={<HSNAPITest />} />
                
                {/* Contact User Routes */}
                <Route path="contact-dashboard" element={<ContactDashboard />} />
                
                {/* Admin Routes */}
                <Route path="admin/users" element={<UserManagement />} />
                
                {/* Default redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
