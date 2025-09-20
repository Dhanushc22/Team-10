import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import LineItemsTable from '../../components/LineItemsTable';

const VendorBill = () => {
  const queryClient = useQueryClient();
  const { data: billData } = useQuery('vendor-bills', () => transactionsAPI.getVendorBills().then(r => r.data));
  const quickPay = useMutation(({ id, amount }) => transactionsAPI.quickAllocatePayment({ target_type: 'bill', target_id: id, amount, payment_method: 'bank' }), {
    onSuccess: () => {
      toast.success('Payment allocated');
      queryClient.invalidateQueries('vendor-bills');
    },
    onError: () => toast.error('Payment failed')
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendor_id: '', bill_date: '', due_date: '', purchase_order_id: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const createMutation = useMutation(() => transactionsAPI.createVendorBillWithItems({ ...form, items }), {
    onSuccess: () => { toast.success('Vendor Bill created'); setShowForm(false); setItems([{ product_id:'', quantity:1, unit_price:0, tax_percent:0 }]); setForm({ vendor_id:'', bill_date:'', due_date:'', purchase_order_id:'' }); queryClient.invalidateQueries('vendor-bills'); },
    onError: () => toast.error('Failed to create vendor bill')
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Bills</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Manage vendor bills and payments</p>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}>New Vendor Bill</button>
        </div>
      </div>
      
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">New Vendor Bill</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="input" placeholder="Vendor ID" value={form.vendor_id} onChange={(e)=>setForm({...form, vendor_id:e.target.value})} />
            <input className="input" type="date" value={form.bill_date} onChange={(e)=>setForm({...form, bill_date:e.target.value})} />
            <input className="input" type="date" value={form.due_date} onChange={(e)=>setForm({...form, due_date:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Purchase Order ID (optional)" value={form.purchase_order_id} onChange={(e)=>setForm({...form, purchase_order_id:e.target.value})} />
          </div>
          <LineItemsTable items={items} setItems={setItems} transactionType="purchase" />
          <div className="flex justify-end mt-4 space-x-3">
            <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>createMutation.mutate()}>Save Vendor Bill</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(billData?.results || billData || []).map((bill) => (
              <tr key={bill.id}>
                <td className="px-4 py-2">{bill.bill_number}</td>
                <td className="px-4 py-2">{bill.vendor?.name}</td>
                <td className="px-4 py-2">₹{bill.grand_total}</td>
                <td className="px-4 py-2">₹{bill.balance_due}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  {bill.balance_due > 0 && (
                    <button onClick={() => quickPay.mutate({ id: bill.id, amount: bill.balance_due })} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Quick Pay</button>
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

export default VendorBill;
