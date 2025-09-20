import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import LineItemsTable from '../../components/LineItemsTable';

const PurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { data: poData } = useQuery('purchase-orders', () => transactionsAPI.getPurchaseOrders().then(r => r.data));
  const convertMutation = useMutation((id) => transactionsAPI.convertPurchaseOrderToBill(id), {
    onSuccess: () => {
      toast.success('Converted to vendor bill');
      queryClient.invalidateQueries('purchase-orders');
    },
    onError: () => toast.error('Conversion failed')
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendor_id: '', po_date: '', delivery_date: '', payment_terms: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const createMutation = useMutation(() => {
    // Client-side validation
    if (!form.vendor_id) {
      throw new Error('Vendor ID is required');
    }
    if (!items.length || items.some(item => !item.product_id || !item.quantity || !item.unit_price)) {
      throw new Error('At least one complete line item is required (product, quantity, unit price)');
    }
    
    const payload = {
      ...form,
      items: items.filter(item => item.product_id) // Only send complete items
    };
    
    console.log('PO Payload:', payload); // Debug log
    return transactionsAPI.createPurchaseOrderWithItems(payload);
  }, {
    onSuccess: () => { 
      toast.success('Purchase Order created'); 
      setShowForm(false); 
      setItems([{ product_id:'', quantity:1, unit_price:0, tax_percent:0 }]); 
      setForm({ vendor_id:'', po_date:'', delivery_date:'', payment_terms:'', notes:'' }); 
      queryClient.invalidateQueries('purchase-orders'); 
    },
    onError: (error) => {
      console.error('PO Creation Error:', error);
      toast.error(error?.response?.data?.error || error?.message || 'Failed to create purchase order');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Create and manage purchase orders</p>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}>New Purchase Order</button>
        </div>
      </div>
      
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">New Purchase Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="input" placeholder="Vendor ID" value={form.vendor_id} onChange={(e)=>setForm({...form, vendor_id:e.target.value})} />
            <input className="input" type="date" value={form.po_date} onChange={(e)=>setForm({...form, po_date:e.target.value})} />
            <input className="input" type="date" value={form.delivery_date} onChange={(e)=>setForm({...form, delivery_date:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Payment terms" value={form.payment_terms} onChange={(e)=>setForm({...form, payment_terms:e.target.value})} />
            <input className="input md:col-span-3" placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </div>
          <LineItemsTable items={items} setItems={setItems} />
          <div className="flex justify-end mt-4 space-x-3">
            <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>createMutation.mutate()}>Save Purchase Order</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO #</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(poData?.results || poData || []).map((po) => (
              <tr key={po.id}>
                <td className="px-4 py-2">{po.po_number}</td>
                <td className="px-4 py-2">{po.vendor?.name}</td>
                <td className="px-4 py-2">₹{po.grand_total}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => convertMutation.mutate(po.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Convert to Bill</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrder;
