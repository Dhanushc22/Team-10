import React from 'react';
import { useQuery } from 'react-query';
import { authAPI, transactionsAPI } from '../services/api';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard,
  BookOpen,
  FileText,
  CreditCard,
  Users,
  Package,
  Percent,
  BookOpenCheck
} from 'lucide-react';

const InvoicingDashboard = () => {
  const { data: stats } = useQuery('auth-dashboard-data', () => authAPI.getDashboardData().then(r => r.data));
  const queryClient = useQueryClient();
  const { data: pendingSummary } = useQuery('pending-transactions', () => transactionsAPI.getPendingTransactions().then(r => r.data));
  const quickPayInvoice = useMutation(({ id, amount }) => transactionsAPI.quickAllocatePayment({ target_type: 'invoice', target_id: id, amount, payment_method: 'cash' }), {
    onSuccess: () => { toast.success('Payment allocated'); queryClient.invalidateQueries('pending-transactions'); },
    onError: () => toast.error('Payment failed'),
  });
  const quickPayBill = useMutation(({ id, amount }) => transactionsAPI.quickAllocatePayment({ target_type: 'bill', target_id: id, amount, payment_method: 'bank' }), {
    onSuccess: () => { toast.success('Payment allocated'); queryClient.invalidateQueries('pending-transactions'); },
    onError: () => toast.error('Payment failed'),
  });

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center"><LayoutDashboard className="w-6 h-6 mr-2"/>Invoicing Dashboard</h1>
        <p className="text-gray-600">Quick access to masters, transactions and reports</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <a href="/master-data/contacts" className="card p-4 flex items-center hover:bg-gray-50">
          <Users className="w-5 h-5 mr-2 text-blue-600"/>Contacts
        </a>
        <a href="/master-data/products" className="card p-4 flex items-center hover:bg-gray-50">
          <Package className="w-5 h-5 mr-2 text-emerald-600"/>Products
        </a>
        <a href="/master-data/taxes" className="card p-4 flex items-center hover:bg-gray-50">
          <Percent className="w-5 h-5 mr-2 text-purple-600"/>Taxes
        </a>
        <a href="/master-data/chart-of-accounts" className="card p-4 flex items-center hover:bg-gray-50">
          <BookOpenCheck className="w-5 h-5 mr-2 text-amber-600"/>Chart of Accounts
        </a>
        <a href="/transactions/customer-invoices" className="card p-4 flex items-center hover:bg-gray-50">
          <FileText className="w-5 h-5 mr-2 text-indigo-600"/>Customer Invoices
        </a>
        <a href="/transactions/payments" className="card p-4 flex items-center hover:bg-gray-50">
          <CreditCard className="w-5 h-5 mr-2 text-rose-600"/>Payments
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-2xl font-bold">₹{stats?.total_sales?.toLocaleString?.() || '0'}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Total Purchases</p>
          <p className="text-2xl font-bold">₹{stats?.total_purchases?.toLocaleString?.() || '0'}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Net Profit</p>
          <p className="text-2xl font-bold">₹{stats?.net_profit?.toLocaleString?.() || '0'}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Cash Balance</p>
          <p className="text-2xl font-bold">₹{stats?.cash_balance?.toLocaleString?.() || '0'}</p>
        </div>
      </div>

      {/* Pending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">Pending Invoices</h3>
          {pendingSummary?.pending_invoices?.length ? (
            <ul className="divide-y">
              {pendingSummary.pending_invoices.slice(0,5).map((inv) => (
                <li key={inv.id} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700">{inv.invoice_number}</span>
                  <span className="font-medium">₹{inv.balance_due}</span>
                  <button onClick={()=>quickPayInvoice.mutate({ id: inv.id, amount: inv.balance_due })} className="ml-3 px-2 py-1 bg-green-600 text-white rounded text-xs">Quick Pay</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No pending invoices.</p>
          )}
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">Pending Bills</h3>
          {pendingSummary?.pending_bills?.length ? (
            <ul className="divide-y">
              {pendingSummary.pending_bills.slice(0,5).map((bill) => (
                <li key={bill.id} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700">{bill.bill_number}</span>
                  <span className="font-medium">₹{bill.balance_due}</span>
                  <button onClick={()=>quickPayBill.mutate({ id: bill.id, amount: bill.balance_due })} className="ml-3 px-2 py-1 bg-green-600 text-white rounded text-xs">Quick Pay</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No pending bills.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicingDashboard;


