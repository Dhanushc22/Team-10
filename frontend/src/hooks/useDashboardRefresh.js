import { useQueryClient } from 'react-query';

// Utility hook for invalidating dashboard cache
export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = () => {
    // Invalidate all dashboard-related queries
    queryClient.invalidateQueries('auth-dashboard-data');
    queryClient.invalidateQueries('contact-user-invoices');
    queryClient.invalidateQueries('contact-user-bills');
    queryClient.invalidateQueries('transaction-summary');
  };

  const refreshAfterTransaction = () => {
    // Force refetch dashboard data after any transaction changes
    refreshDashboard();
    
    // Also invalidate any transaction lists
    queryClient.invalidateQueries('customer-invoices');
    queryClient.invalidateQueries('vendor-bills');
    queryClient.invalidateQueries('payments');
    queryClient.invalidateQueries('purchase-orders');
    queryClient.invalidateQueries('sales-orders');
  };

  const refreshAfterPayment = () => {
    // Refresh specifically after payment transactions
    refreshDashboard();
    queryClient.invalidateQueries('payments');
  };

  const refreshAfterInvoiceStatusChange = () => {
    // Refresh after invoice status changes (pending to paid, etc.)
    refreshDashboard();
    queryClient.invalidateQueries('customer-invoices');
  };

  return {
    refreshDashboard,
    refreshAfterTransaction,
    refreshAfterPayment,
    refreshAfterInvoiceStatusChange,
  };
};

// Query keys for consistent caching
export const queryKeys = {
  dashboard: 'auth-dashboard-data',
  customerInvoices: 'customer-invoices',
  vendorBills: 'vendor-bills',
  payments: 'payments',
  contactUserInvoices: 'contact-user-invoices',
  contactUserBills: 'contact-user-bills',
  transactionSummary: 'transaction-summary',
};