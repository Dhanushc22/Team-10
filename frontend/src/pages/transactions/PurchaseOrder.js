import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import LineItemsTable from '../../components/LineItemsTable';
import AsyncContactSelect from '../../components/AsyncContactSelect';

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
  // Set today's date as default for PO date
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ vendor_id: '', po_date: today, delivery_date: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const [vendorDetails, setVendorDetails] = useState({ name: '', email: '', mobile: '', address: '', gst_number: '' });

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
      setItems([{ 
        product_id:'', 
        product_name: '',
        quantity:1, 
        unit_price:0, 
        tax_percent:0,
        subtotal: 0,
        tax_amount: 0,
        total: 0
      }]); 
      setForm({ vendor_id:'', po_date:today, delivery_date:'' });
      setVendorDetails({ name: '', email: '', mobile: '', address: '', gst_number: '' }); 
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor *</label>
              <AsyncContactSelect
                value={form.vendor_id}
                onChange={(vendorId) => setForm({...form, vendor_id: vendorId})}
                onContactDetails={setVendorDetails}
                contactType="vendor"
                placeholder="Search vendors by name or ID..."
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Date *</label>
              <input 
                className="input" 
                type="date" 
                value={form.po_date} 
                onChange={(e)=>setForm({...form, po_date:e.target.value})}
                title="Purchase Order Date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input 
                className="input" 
                type="date" 
                value={form.delivery_date} 
                onChange={(e)=>setForm({...form, delivery_date:e.target.value})}
                title="Expected Delivery Date"
              />
            </div>
            
            {/* Vendor Contact Details Section */}
            {vendorDetails.name && (
              <div className="md:col-span-3 border-t pt-4 mt-2">
                <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                  Vendor Contact Details
                  <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {vendorDetails.name}
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input 
                      className="input bg-gray-50" 
                      value={vendorDetails.email} 
                      readOnly
                      placeholder="No email provided"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                    <input 
                      className="input bg-gray-50" 
                      value={vendorDetails.mobile} 
                      readOnly
                      placeholder="No phone provided"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">GST Number</label>
                    <input 
                      className="input bg-gray-50 font-mono text-sm" 
                      value={vendorDetails.gst_number} 
                      readOnly
                      placeholder="No GST provided"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                    <input 
                      className="input bg-gray-50" 
                      value={vendorDetails.address} 
                      readOnly
                      placeholder="No address provided"
                    />
                  </div>
                </div>
              </div>
            )}
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
                <td className="px-4 py-2">
                  {po.vendor_name || po.vendor?.name || `Vendor ID: ${po.vendor}`}
                </td>
                <td className="px-4 py-2">₹{po.grand_total}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <a href={`/transactions/purchase-orders/${po.id}`} className="px-3 py-1 bg-gray-100 rounded-md text-sm">View</a>
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
