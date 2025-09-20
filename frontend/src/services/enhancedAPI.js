// Enhanced API wrapper with automatic cache invalidation
import { queryKeys } from '../hooks/useDashboardRefresh';

// Global query client reference (to be set by the main App component)
let globalQueryClient = null;

export const setQueryClient = (queryClient) => {
  globalQueryClient = queryClient;
};

// Utility to invalidate caches after transaction operations
const invalidateTransactionCaches = () => {
  if (globalQueryClient) {
    globalQueryClient.invalidateQueries(queryKeys.dashboard);
    globalQueryClient.invalidateQueries(queryKeys.customerInvoices);
    globalQueryClient.invalidateQueries(queryKeys.vendorBills);
    globalQueryClient.invalidateQueries(queryKeys.payments);
    globalQueryClient.invalidateQueries(queryKeys.contactUserInvoices);
    globalQueryClient.invalidateQueries(queryKeys.contactUserBills);
    globalQueryClient.invalidateQueries(queryKeys.transactionSummary);
  }
};

// Wrapper for transaction API calls that auto-refresh dashboard
export const createTransactionAPIWrapper = (originalAPI) => {
  return {
    ...originalAPI,
    
    // Customer Invoices
    createCustomerInvoice: async (data) => {
      const response = await originalAPI.createCustomerInvoice(data);
      invalidateTransactionCaches();
      return response;
    },
    
    updateCustomerInvoice: async (id, data) => {
      const response = await originalAPI.updateCustomerInvoice(id, data);
      invalidateTransactionCaches();
      return response;
    },
    
    deleteCustomerInvoice: async (id) => {
      const response = await originalAPI.deleteCustomerInvoice(id);
      invalidateTransactionCaches();
      return response;
    },

    // Vendor Bills
    createVendorBill: async (data) => {
      const response = await originalAPI.createVendorBill(data);
      invalidateTransactionCaches();
      return response;
    },
    
    updateVendorBill: async (id, data) => {
      const response = await originalAPI.updateVendorBill(id, data);
      invalidateTransactionCaches();
      return response;
    },
    
    deleteVendorBill: async (id) => {
      const response = await originalAPI.deleteVendorBill(id);
      invalidateTransactionCaches();
      return response;
    },

    // Payments
    createPayment: async (data) => {
      const response = await originalAPI.createPayment(data);
      invalidateTransactionCaches();
      return response;
    },
    
    updatePayment: async (id, data) => {
      const response = await originalAPI.updatePayment(id, data);
      invalidateTransactionCaches();
      return response;
    },
    
    deletePayment: async (id) => {
      const response = await originalAPI.deletePayment(id);
      invalidateTransactionCaches();
      return response;
    },

    // Sales Orders
    createSalesOrder: async (data) => {
      const response = await originalAPI.createSalesOrder(data);
      invalidateTransactionCaches();
      return response;
    },
    
    updateSalesOrder: async (id, data) => {
      const response = await originalAPI.updateSalesOrder(id, data);
      invalidateTransactionCaches();
      return response;
    },
    
    deleteSalesOrder: async (id) => {
      const response = await originalAPI.deleteSalesOrder(id);
      invalidateTransactionCaches();
      return response;
    },

    // Purchase Orders
    createPurchaseOrder: async (data) => {
      const response = await originalAPI.createPurchaseOrder(data);
      invalidateTransactionCaches();
      return response;
    },
    
    updatePurchaseOrder: async (id, data) => {
      const response = await originalAPI.updatePurchaseOrder(id, data);
      invalidateTransactionCaches();
      return response;
    },
    
    deletePurchaseOrder: async (id) => {
      const response = await originalAPI.deletePurchaseOrder(id);
      invalidateTransactionCaches();
      return response;
    },
  };
};