import React from 'react';
import { useQuery } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CustomerInvoice = () => {
  const { isContact } = useAuth();
  const { data: invData } = useQuery('customer-invoices', () => {
    if (isContact) {
      return transactionsAPI.getContactUserInvoices().then(r => r.data);
    }
    return transactionsAPI.getCustomerInvoices().then(r => r.data);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Invoices</h1>
        <p className="text-gray-600">Create and manage customer invoices</p>
      </div>
      

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(invData?.results || invData || []).map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-2">{inv.invoice_number}</td>
                <td className="px-4 py-2">
                  {inv.customer_name || inv.customer?.name || `Customer ID: ${inv.customer}`}
                </td>
                <td className="px-4 py-2">₹{inv.grand_total}</td>
                <td className="px-4 py-2">₹{inv.balance_due}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <a href={`/transactions/customer-invoices/${inv.id}`} className="px-3 py-1 bg-gray-100 rounded-md text-sm">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerInvoice;
