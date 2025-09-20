import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import LineItemsTable from '../../components/LineItemsTable';

const SalesOrder = () => {
  const queryClient = useQueryClient();
  const { data: soData } = useQuery('sales-orders', () => transactionsAPI.getSalesOrders().then(r => r.data));
  const convertMutation = useMutation((id) => transactionsAPI.convertSalesOrderToInvoice(id), {
    onSuccess: () => {
      toast.success('Converted to invoice');
      queryClient.invalidateQueries('sales-orders');
    },
    onError: () => toast.error('Conversion failed')
  });

  // Create SO with items
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', so_date: '', delivery_date: '', payment_terms: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const createMutation = useMutation(() => {
    // Client-side validation
    if (!form.customer_id) {
      throw new Error('Customer ID is required');
    }
    if (!items.length || items.some(item => !item.product_id || !item.quantity || !item.unit_price)) {
      throw new Error('At least one complete line item is required (product, quantity, unit price)');
    }
    
    const payload = {
      ...form,
      items: items.filter(item => item.product_id) // Only send complete items
    };
    
    console.log('SO Payload:', payload); // Debug log
    return transactionsAPI.createSalesOrderWithItems(payload);
  }, {
    onSuccess: () => { 
      toast.success('Sales Order created'); 
      setShowForm(false); 
      setItems([{ product_id:'', quantity:1, unit_price:0, tax_percent:0 }]); 
      setForm({ customer_id:'', so_date:'', delivery_date:'', payment_terms:'', notes:'' }); 
      queryClient.invalidateQueries('sales-orders'); 
    },
    onError: (error) => {
      console.error('SO Creation Error:', error);
      toast.error(error?.response?.data?.error || error?.message || 'Failed to create sales order');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Create and manage sales orders</p>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}>New Sales Order</button>
        </div>
      </div>
      
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">New Sales Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="input" placeholder="Customer ID" value={form.customer_id} onChange={(e)=>setForm({...form, customer_id:e.target.value})} />
            <input className="input" type="date" value={form.so_date} onChange={(e)=>setForm({...form, so_date:e.target.value})} />
            <input className="input" type="date" value={form.delivery_date} onChange={(e)=>setForm({...form, delivery_date:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Payment terms" value={form.payment_terms} onChange={(e)=>setForm({...form, payment_terms:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </div>
          <LineItemsTable items={items} setItems={setItems} />
          <div className="flex justify-end mt-4 space-x-3">
            <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>createMutation.mutate()}>Save Sales Order</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SO #</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(soData?.results || soData || []).map((so) => (
              <tr key={so.id}>
                <td className="px-4 py-2">{so.so_number}</td>
                <td className="px-4 py-2">{so.customer?.name}</td>
                <td className="px-4 py-2">₹{so.grand_total}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => convertMutation.mutate(so.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Convert to Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesOrder;
