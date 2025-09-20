import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContactMaster from './pages/master-data/ContactMaster';
import ProductMaster from './pages/master-data/ProductMaster';
import TaxMaster from './pages/master-data/TaxMaster';
import ChartOfAccounts from './pages/master-data/ChartOfAccounts';
import PurchaseOrder from './pages/transactions/PurchaseOrder';
import VendorBill from './pages/transactions/VendorBill';
import SalesOrder from './pages/transactions/SalesOrder';
import CustomerInvoice from './pages/transactions/CustomerInvoice';
import Payments from './pages/transactions/Payments';
import BalanceSheet from './pages/reports/BalanceSheet';
import ProfitLoss from './pages/reports/ProfitLoss';
import StockReport from './pages/reports/StockReport';
import PartnerLedger from './pages/reports/PartnerLedger';
import ContactDashboard from './pages/ContactDashboard';

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
                
                {/* Master Data Routes */}
                <Route path="master-data/contacts" element={<ContactMaster />} />
                <Route path="master-data/products" element={<ProductMaster />} />
                <Route path="master-data/taxes" element={<TaxMaster />} />
                <Route path="master-data/chart-of-accounts" element={<ChartOfAccounts />} />
                
                {/* Transaction Routes */}
                <Route path="transactions/purchase-orders" element={<PurchaseOrder />} />
                <Route path="transactions/vendor-bills" element={<VendorBill />} />
                <Route path="transactions/sales-orders" element={<SalesOrder />} />
                <Route path="transactions/customer-invoices" element={<CustomerInvoice />} />
                <Route path="transactions/payments" element={<Payments />} />
                
                {/* Report Routes */}
                <Route path="reports/balance-sheet" element={<BalanceSheet />} />
                <Route path="reports/profit-loss" element={<ProfitLoss />} />
                <Route path="reports/stock-report" element={<StockReport />} />
                <Route path="reports/partner-ledger" element={<PartnerLedger />} />
                
                {/* Contact User Routes */}
                <Route path="contact-dashboard" element={<ContactDashboard />} />
                
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
