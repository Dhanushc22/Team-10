import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { transactionsAPI, masterDataAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Payments = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: paymentData, isLoading: paymentsLoading } = useQuery('payments', () => transactionsAPI.getPayments().then(r => r.data));
  const { data: invData } = useQuery('customer-invoices', () => transactionsAPI.getCustomerInvoices().then(r => r.data));
  const { data: billData } = useQuery('vendor-bills', () => transactionsAPI.getVendorBills().then(r => r.data));
  const { data: contactsData } = useQuery('contacts', () => masterDataAPI.getContacts().then(r => r.data));

  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState('customer_payment');
  const [contactId, setContactId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState([]); // {target_type:'invoice'|'bill', target_id, amount}

  // Handle pre-filled data from purchase order or sales order navigation
  useEffect(() => {
    const fromPurchaseOrder = searchParams.get('from') === 'purchase-order';
    const fromSalesOrder = searchParams.get('from') === 'sales-order';
    
    if (fromPurchaseOrder || fromSalesOrder) {
      const prefillData = sessionStorage.getItem('prefillPaymentData');
      if (prefillData) {
        try {
          const data = JSON.parse(prefillData);
          setMode(data.mode || 'vendor_payment');
          setContactId(data.contactId || '');
          setReference(data.reference || '');
          setNotes(data.notes || '');
          setShowForm(true); // Auto-open the form
          
          // Clear the session storage after using
          sessionStorage.removeItem('prefillPaymentData');
          
          // Show a helpful message
          const sourceName = fromPurchaseOrder ? 'purchase order' : 'sales order';
          const contactName = data.vendor_name || data.customer_name;
          toast.success(`Payment form pre-filled from ${sourceName}. Contact: ${contactName}`, {
            duration: 4000,
            icon: fromPurchaseOrder ? '💳' : '💰'
          });
        } catch (error) {
          console.error('Error parsing prefill data:', error);
        }
      }
    }
  }, [searchParams]);

  const addRow = (row) => setRows([...rows, row]);
  const removeRow = (idx) => setRows(rows.filter((_, i)=>i!==idx));
  const updateRow = (idx, key, value) => { const next=[...rows]; next[idx] = { ...next[idx], [key]: value }; setRows(next); };

  // Enhanced payment creation that creates a proper payment record with allocations
  const createPayment = useMutation(async () => {
    if (!rows.length) {
      throw new Error('Add at least one payment allocation');
    }
    
    // Calculate total amount
    const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    
    if (totalAmount <= 0) {
      throw new Error('Total payment amount must be greater than 0');
    }

    // Create the main payment record
    const paymentData = {
      payment_type: mode,
      contact_id: contactId,
      payment_date: date,
      payment_method: paymentMethod,
      amount: totalAmount,
      reference: reference,
      notes: notes
    };

    const paymentResponse = await transactionsAPI.createPayment(paymentData);
    const paymentId = paymentResponse.data.id;

    // Create allocations for each row
    for (const r of rows) {
      if (!r.target_id || Number(r.amount) <= 0) continue;
      await transactionsAPI.quickAllocatePayment({ 
        target_type: r.target_type, 
        target_id: r.target_id, 
        amount: Number(r.amount), 
        payment_method: paymentMethod 
      });
    }
    
    return paymentResponse;
  }, {
    onSuccess: () => { 
      toast.success('Payment recorded successfully'); 
      setRows([]); 
      setContactId('');
      setReference('');
      setNotes('');
      setShowForm(false);
      queryClient.invalidateQueries('payments');
      queryClient.invalidateQueries('customer-invoices'); 
      queryClient.invalidateQueries('vendor-bills'); 
    },
    onError: (error) => toast.error(error.message || 'Failed to record payment')
  });

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const totalAllocation = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Record and manage customer and vendor payments</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          New Payment
        </button>
      </div>

      {/* Existing Payments List */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        {paymentsLoading ? (
          <div className="p-6 text-center">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(paymentData?.results || paymentData || []).map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.payment_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.payment_type === 'customer_payment' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.payment_type === 'customer_payment' ? 'Customer' : 'Vendor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.contact_name || payment.contact?.name || `Contact ID: ${payment.contact}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.reference || '-'}
                    </td>
                  </tr>
                ))}
                {(!paymentData?.results && !paymentData) || (paymentData?.results || paymentData || []).length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Payment Form */}
      {showForm && (
        <div className="card p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Record New Payment</h3>
              {((searchParams.get('from') === 'purchase-order' && reference.includes('PO')) ||
                (searchParams.get('from') === 'sales-order' && reference.includes('SO'))) && (
                <p className="text-sm text-green-600 mt-1">
                  {searchParams.get('from') === 'purchase-order' ? '💳 Pre-filled from Purchase Order' : '💰 Pre-filled from Sales Order'}
                </p>
              )}
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => {setShowForm(false); setRows([]); setContactId(''); setReference(''); setNotes('');}}
            >
              ✕
            </button>
          </div>
          
          {/* Payment Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select className="input" value={mode} onChange={(e)=>setMode(e.target.value)}>
                  <option value="customer_payment">Customer Payment (Money Received)</option>
                  <option value="vendor_payment">Vendor Payment (Money Paid)</option>
                </select>
              </div>

              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === 'customer_payment' ? 'Customer' : 'Vendor'}
                </label>
                <select 
                  className="input" 
                  value={contactId} 
                  onChange={(e)=>setContactId(e.target.value)}
                  required
                >
                  <option value="">Select {mode === 'customer_payment' ? 'Customer' : 'Vendor'}</option>
                  {(contactsData?.results || contactsData || [])
                    .filter(contact => {
                      if (mode === 'customer_payment') {
                        return contact.type === 'customer' || contact.type === 'both';
                      } else {
                        return contact.type === 'vendor' || contact.type === 'both';
                      }
                    })
                    .map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.email || contact.mobile}
                      </option>
                    ))
                  }
                </select>
                {!contactId && (
                  <p className="text-xs text-gray-500 mt-1">Choose who you're receiving payment from or paying to</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="input" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online/UPI</option>
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input 
                  className="input" 
                  type="date" 
                  value={date} 
                  onChange={(e)=>setDate(e.target.value)}
                  required
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input 
                  className="input" 
                  placeholder="e.g., Check #123, UPI Ref: ABC123" 
                  value={reference} 
                  onChange={(e)=>setReference(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Transaction ID, check number, or payment reference</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input 
                  className="input" 
                  placeholder="Additional notes (optional)" 
                  value={notes} 
                  onChange={(e)=>setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Allocations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Allocate Amount</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm font-medium capitalize">
                      {r.target_type === 'invoice' ? 'Invoice' : 'Bill'}
                    </td>
                    <td className="px-4 py-2 text-sm">{r.ref || r.target_id}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrency(r.balance)}</td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        step="0.01" 
                        className="input w-32" 
                        value={r.amount} 
                        onChange={(e)=>updateRow(idx,'amount',e.target.value)}
                        min="0.01"
                        max={r.balance}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={()=>removeRow(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Add invoice or bill allocations below
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          {rows.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <span className="text-sm text-gray-600">Total Payment Amount: </span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(totalAllocation)}</span>
              </div>
            </div>
          )}

          {/* Pending Invoices and Bills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Pending Invoices</h4>
              <div className="max-h-64 overflow-auto border rounded-lg">
                {(invData?.results || invData || []).filter((i)=>Number(i.balance_due)>0).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{inv.invoice_number}</div>
                      <div className="text-xs text-gray-500">
                        Customer: {inv.customer_name || inv.customer?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-600">Due: {formatCurrency(inv.balance_due)}</div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={()=>addRow({ 
                        target_type:'invoice', 
                        target_id: inv.id, 
                        ref: inv.invoice_number, 
                        balance: inv.balance_due, 
                        amount: inv.balance_due 
                      })}
                      disabled={rows.some(r => r.target_type === 'invoice' && r.target_id === inv.id)}
                    >
                      {rows.some(r => r.target_type === 'invoice' && r.target_id === inv.id) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
                {(invData?.results || invData || []).filter((i)=>Number(i.balance_due)>0).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No pending invoices
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Pending Bills</h4>
              <div className="max-h-64 overflow-auto border rounded-lg">
                {(billData?.results || billData || []).filter((b)=>Number(b.balance_due)>0).map(bill => (
                  <div key={bill.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bill.bill_number}</div>
                      <div className="text-xs text-gray-500">
                        Vendor: {bill.vendor_name || bill.vendor?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-600">Due: {formatCurrency(bill.balance_due)}</div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={()=>addRow({ 
                        target_type:'bill', 
                        target_id: bill.id, 
                        ref: bill.bill_number, 
                        balance: bill.balance_due, 
                        amount: bill.balance_due 
                      })}
                      disabled={rows.some(r => r.target_type === 'bill' && r.target_id === bill.id)}
                    >
                      {rows.some(r => r.target_type === 'bill' && r.target_id === bill.id) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
                {(billData?.results || billData || []).filter((b)=>Number(b.balance_due)>0).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No pending bills
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              className="btn btn-secondary" 
              onClick={() => {setShowForm(false); setRows([]); setContactId(''); setReference(''); setNotes('');}}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (!contactId) { 
                  toast.error('Please select a contact'); 
                  return; 
                }
                if (!rows.length) { 
                  toast.error('Add at least one payment allocation'); 
                  return; 
                }
                createPayment.mutate();
              }}
              disabled={createPayment.isLoading}
            >
              {createPayment.isLoading ? 'Recording...' : `Record Payment (${formatCurrency(totalAllocation)})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
