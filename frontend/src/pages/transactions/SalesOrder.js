import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI, masterDataAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
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
  // Set today's date as default for SO date
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ customer_id: '', so_date: today, delivery_date: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const [customerDetails, setCustomerDetails] = useState({ email: '', mobile: '', address: '', gst_number: '' });
  const [fetchingCustomer, setFetchingCustomer] = useState(false);

  // Fetch customer details when customer_id changes
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (form.customer_id && form.customer_id.trim()) {
        setFetchingCustomer(true);
        try {
          const response = await masterDataAPI.getContact(form.customer_id);
          const customer = response.data;
          setCustomerDetails({
            email: customer.email || '',
            mobile: customer.mobile || '',
            address: customer.address || '',
            gst_number: customer.gst_number || ''
          });
        } catch (error) {
          console.error('Error fetching customer details:', error);
          setCustomerDetails({ email: '', mobile: '', address: '', gst_number: '' });
          if (error.response?.status === 404) {
            toast.error('Customer not found');
          }
        } finally {
          setFetchingCustomer(false);
        }
      } else {
        setCustomerDetails({ email: '', mobile: '', address: '', gst_number: '' });
      }
    };

    fetchCustomerDetails();
  }, [form.customer_id]);

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
      setForm({ customer_id:'', so_date:today, delivery_date:'' });
      setCustomerDetails({ email: '', mobile: '', address: '', gst_number: '' }); 
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
              <input 
                className="input" 
                placeholder="Enter Customer ID (e.g., 1)" 
                value={form.customer_id} 
                onChange={(e)=>setForm({...form, customer_id:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SO Date *</label>
              <input 
                className="input" 
                type="date" 
                value={form.so_date} 
                onChange={(e)=>setForm({...form, so_date:e.target.value})}
                title="Sales Order Date"
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
            
            {/* Customer Contact Details Section */}
            <div className="md:col-span-3 border-t pt-4 mt-2">
              <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                Customer Contact Details 
                {fetchingCustomer && <span className="ml-2 text-xs text-blue-600">(Loading...)</span>}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input 
                    className="input bg-gray-50" 
                    value={customerDetails.email} 
                    readOnly
                    placeholder={form.customer_id ? "Enter valid Customer ID" : "Auto-filled when Customer ID is entered"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <input 
                    className="input bg-gray-50" 
                    value={customerDetails.mobile} 
                    readOnly
                    placeholder={form.customer_id ? "Enter valid Customer ID" : "Auto-filled when Customer ID is entered"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">GST Number</label>
                  <input 
                    className="input bg-gray-50 font-mono text-sm" 
                    value={customerDetails.gst_number} 
                    readOnly
                    placeholder={form.customer_id ? "Enter valid Customer ID" : "Auto-filled when Customer ID is entered"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <input 
                    className="input bg-gray-50" 
                    value={customerDetails.address} 
                    readOnly
                    placeholder={form.customer_id ? "Enter valid Customer ID" : "Auto-filled when Customer ID is entered"}
                  />
                </div>
              </div>
            </div>
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
