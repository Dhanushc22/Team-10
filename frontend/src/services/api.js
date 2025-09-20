import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('🔑 API Request with token:', config.url, 'Token exists:', !!token);
    } else {
      console.warn('⚠️ API Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('🚫 API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
  getDashboardData: () => api.get('/auth/dashboard-data/'),
};

// Master Data API
export const masterDataAPI = {
  // Contacts
  getContacts: (params) => api.get('/master-data/contacts/', { params }),
  getContact: (id) => api.get(`/master-data/contacts/${id}/`),
  createContact: (data) => api.post('/master-data/contacts/', data),
  updateContact: (id, data) => api.put(`/master-data/contacts/${id}/`, data),
  deleteContact: (id) => api.delete(`/master-data/contacts/${id}/`),
  
  // Products
  getProducts: (params) => api.get('/master-data/products/', { params }),
  getProduct: (id) => api.get(`/master-data/products/${id}/`),
  createProduct: (data) => api.post('/master-data/products/', data),
  updateProduct: (id, data) => api.put(`/master-data/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/master-data/products/${id}/`),
  
  // Taxes
  getTaxes: (params) => api.get('/master-data/taxes/', { params }),
  getTax: (id) => api.get(`/master-data/taxes/${id}/`),
  createTax: (data) => api.post('/master-data/taxes/', data),
  updateTax: (id, data) => api.put(`/master-data/taxes/${id}/`, data),
  deleteTax: (id) => api.delete(`/master-data/taxes/${id}/`),
  
  // Chart of Accounts
  getChartOfAccounts: (params) => api.get('/master-data/chart-of-accounts/', { params }),
  getChartOfAccount: (id) => api.get(`/master-data/chart-of-accounts/${id}/`),
  createChartOfAccount: (data) => api.post('/master-data/chart-of-accounts/', data),
  updateChartOfAccount: (id, data) => api.put(`/master-data/chart-of-accounts/${id}/`, data),
  deleteChartOfAccount: (id) => api.delete(`/master-data/chart-of-accounts/${id}/`),
  
  // Summary
  getMasterDataSummary: () => api.get('/master-data/summary/'),
};

// Transactions API
export const transactionsAPI = {
  // Purchase Orders
  getPurchaseOrders: (params) => api.get('/transactions/purchase-orders/', { params }),
  getPurchaseOrder: (id) => api.get(`/transactions/purchase-orders/${id}/`),
  createPurchaseOrder: (data) => api.post('/transactions/purchase-orders/', data),
  updatePurchaseOrder: (id, data) => api.put(`/transactions/purchase-orders/${id}/`, data),
  deletePurchaseOrder: (id) => api.delete(`/transactions/purchase-orders/${id}/`),
  
  // Vendor Bills
  getVendorBills: (params) => api.get('/transactions/vendor-bills/', { params }),
  getVendorBill: (id) => api.get(`/transactions/vendor-bills/${id}/`),
  createVendorBill: (data) => api.post('/transactions/vendor-bills/', data),
  updateVendorBill: (id, data) => api.put(`/transactions/vendor-bills/${id}/`, data),
  deleteVendorBill: (id) => api.delete(`/transactions/vendor-bills/${id}/`),
  
  // Sales Orders
  getSalesOrders: (params) => api.get('/transactions/sales-orders/', { params }),
  getSalesOrder: (id) => api.get(`/transactions/sales-orders/${id}/`),
  createSalesOrder: (data) => api.post('/transactions/sales-orders/', data),
  updateSalesOrder: (id, data) => api.put(`/transactions/sales-orders/${id}/`, data),
  deleteSalesOrder: (id) => api.delete(`/transactions/sales-orders/${id}/`),
  
  // Customer Invoices
  getCustomerInvoices: (params) => api.get('/transactions/customer-invoices/', { params }),
  getCustomerInvoice: (id) => api.get(`/transactions/customer-invoices/${id}/`),
  createCustomerInvoice: (data) => api.post('/transactions/customer-invoices/', data),
  updateCustomerInvoice: (id, data) => api.put(`/transactions/customer-invoices/${id}/`, data),
  deleteCustomerInvoice: (id) => api.delete(`/transactions/customer-invoices/${id}/`),
  
  // Payments
  getPayments: (params) => api.get('/transactions/payments/', { params }),
  getPayment: (id) => api.get(`/transactions/payments/${id}/`),
  createPayment: (data) => api.post('/transactions/payments/', data),
  updatePayment: (id, data) => api.put(`/transactions/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/transactions/payments/${id}/`),
  
  // Contact User APIs
  getContactUserInvoices: () => api.get('/transactions/contact-user/invoices/'),
  getContactUserBills: () => api.get('/transactions/contact-user/bills/'),
  
  // Summary
  getTransactionSummary: () => api.get('/transactions/summary/'),
  getPendingTransactions: () => api.get('/transactions/pending/'),

  // Conversions
  convertSalesOrderToInvoice: (id) => api.post(`/transactions/sales-orders/${id}/convert-to-invoice/`),
  convertPurchaseOrderToBill: (id) => api.post(`/transactions/purchase-orders/${id}/convert-to-bill/`),

  // Quick payments
  quickAllocatePayment: (payload) => api.post('/transactions/payments/quick-allocate/', payload),

  // Create/Update with items (SO)
  createSalesOrderWithItems: (data) => api.post('/transactions/sales-orders/create-with-items/', data),
  updateSalesOrderWithItems: (id, data) => api.put(`/transactions/sales-orders/${id}/update-with-items/`, data),

  // Create/Update with items (PO)
  createPurchaseOrderWithItems: (data) => api.post('/transactions/purchase-orders/create-with-items/', data),
  updatePurchaseOrderWithItems: (id, data) => api.put(`/transactions/purchase-orders/${id}/update-with-items/`, data),

  // Create/Update with items (Invoice/Bill)
  createCustomerInvoiceWithItems: (data) => api.post('/transactions/customer-invoices/create-with-items/', data),
  updateCustomerInvoiceWithItems: (id, data) => api.put(`/transactions/customer-invoices/${id}/update-with-items/`, data),
  createVendorBillWithItems: (data) => api.post('/transactions/vendor-bills/create-with-items/', data),
  updateVendorBillWithItems: (id, data) => api.put(`/transactions/vendor-bills/${id}/update-with-items/`, data),
};

// Reports API
export const reportsAPI = {
  getBalanceSheet: (params) => api.get('/reports/balance-sheet/', { params }),
  getProfitLoss: (params) => api.get('/reports/profit-loss/', { params }),
  getPartnerLedger: (params) => api.get('/reports/partner-ledger/', { params }),
  getStockReport: (params) => api.get('/reports/stock-report/', { params }),
  getDashboardSummary: () => api.get('/reports/dashboard-summary/'),
  
  // Stock Management
  getStockMovements: (params) => api.get('/reports/stock-movements/', { params }),
  createStockMovement: (data) => api.post('/reports/stock-movements/', data),
  getStockBalances: (params) => api.get('/reports/stock-balances/', { params }),
};

export default api;
