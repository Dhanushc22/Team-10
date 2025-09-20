import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { transactionsAPI } from '../../services/api';

const InvoiceDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(['invoice', id], () => transactionsAPI.getCustomerInvoice(id).then(r => r.data));

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load invoice</div>;

  const inv = data;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Invoice {inv.invoice_number}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Customer</p>
          <p className="font-medium">{inv.customer?.name}</p>
          <p className="text-sm text-gray-600 mt-2">Status</p>
          <p className="font-medium capitalize">{inv.status}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Amount</p>
          <p className="font-medium">₹{inv.grand_total}</p>
          <p className="text-sm text-gray-600 mt-2">Date</p>
          <p className="font-medium">{inv.invoice_date}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;


