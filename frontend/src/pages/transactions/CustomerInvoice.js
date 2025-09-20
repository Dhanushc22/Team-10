import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import LineItemsTable from '../../components/LineItemsTable';
import { useAuth } from '../../contexts/AuthContext';

const CustomerInvoice = () => {
  const queryClient = useQueryClient();
  const { isAdmin, isInvoicingUser, isContact } = useAuth();
  const { data: invData } = useQuery('customer-invoices', () => {
    if (isContact) {
      return transactionsAPI.getContactUserInvoices().then(r => r.data);
    }
    return transactionsAPI.getCustomerInvoices().then(r => r.data);
  });
  const quickPay = useMutation(({ id, amount }) => transactionsAPI.quickAllocatePayment({ target_type: 'invoice', target_id: id, amount, payment_method: 'cash' }), {
    onSuccess: () => {
      toast.success('Payment allocated');
      queryClient.invalidateQueries('customer-invoices');
    },
    onError: () => toast.error('Payment failed')
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', invoice_date: '', due_date: '', reference: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const createMutation = useMutation(() => transactionsAPI.createCustomerInvoiceWithItems({ ...form, items }), {
    onSuccess: () => { toast.success('Invoice created'); setShowForm(false); setItems([{ product_id:'', quantity:1, unit_price:0, tax_percent:0 }]); setForm({ customer_id:'', invoice_date:'', due_date:'', reference:'' }); queryClient.invalidateQueries('customer-invoices'); },
    onError: (e) => {
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to create invoice';
      toast.error(msg);
    }
  });

  const handleSave = () => {
    if (!form.customer_id) {
      toast.error('Customer ID is required');
      return;
    }
    if (!items.length) {
      toast.error('Add at least one line item');
      return;
    }
    const invalid = items.some(it => !it.product_id || Number(it.quantity) <= 0 || Number(it.unit_price) < 0);
    if (invalid) {
      toast.error('Each line needs product, qty (>0), unit price (>=0)');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Invoices</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Create and manage customer invoices</p>
          {(isAdmin || isInvoicingUser) && (
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>New Invoice</button>
          )}
        </div>
      </div>
      
      {showForm && (isAdmin || isInvoicingUser) && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">New Customer Invoice</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="input" placeholder="Customer ID" value={form.customer_id} onChange={(e)=>setForm({...form, customer_id:e.target.value})} />
            <input className="input" type="date" value={form.invoice_date} onChange={(e)=>setForm({...form, invoice_date:e.target.value})} />
            <input className="input" type="date" value={form.due_date} onChange={(e)=>setForm({...form, due_date:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Reference (SO)" value={form.reference} onChange={(e)=>setForm({...form, reference:e.target.value})} />
          </div>
          <LineItemsTable items={items} setItems={setItems} transactionType="sales" />
          <div className="flex justify-end mt-4 space-x-3">
            <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Invoice</button>
          </div>
        </div>
      )}

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
                <td className="px-4 py-2">{inv.customer?.name}</td>
                <td className="px-4 py-2">₹{inv.grand_total}</td>
                <td className="px-4 py-2">₹{inv.balance_due}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <a href={`/transactions/customer-invoices/${inv.id}`} className="px-3 py-1 bg-gray-100 rounded-md text-sm">View</a>
                  {inv.balance_due > 0 && (isAdmin || isInvoicingUser || isContact) && (
                    <button onClick={() => quickPay.mutate({ id: inv.id, amount: inv.balance_due })} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Quick Pay</button>
                  )}
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
