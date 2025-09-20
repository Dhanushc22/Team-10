import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Payments = () => {
  const queryClient = useQueryClient();
  const { data: invData } = useQuery('customer-invoices', () => transactionsAPI.getCustomerInvoices().then(r => r.data));
  const { data: billData } = useQuery('vendor-bills', () => transactionsAPI.getVendorBills().then(r => r.data));

  const [mode, setMode] = useState('customer_payment');
  const [contactId, setContactId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [date, setDate] = useState('');
  const [rows, setRows] = useState([]); // {target_type:'invoice'|'bill', target_id, amount}

  const addRow = (row) => setRows([...rows, row]);
  const removeRow = (idx) => setRows(rows.filter((_, i)=>i!==idx));
  const updateRow = (idx, key, value) => { const next=[...rows]; next[idx] = { ...next[idx], [key]: value }; setRows(next); };

  const createPayment = useMutation(async () => {
    // Create one payment and multiple allocations by repeated quick calls (prototype)
    for (const r of rows) {
      if (!r.target_id || Number(r.amount) <= 0) continue;
      await transactionsAPI.quickAllocatePayment({ target_type: r.target_type, target_id: r.target_id, amount: Number(r.amount), payment_method: paymentMethod });
    }
  }, {
    onSuccess: () => { toast.success('Payment allocations recorded'); setRows([]); queryClient.invalidateQueries('customer-invoices'); queryClient.invalidateQueries('vendor-bills'); },
    onError: () => toast.error('Failed to allocate payments')
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Record and allocate multiple payments in one go (prototype)</p>
      </div>
      
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="input" value={mode} onChange={(e)=>setMode(e.target.value)}>
            <option value="customer_payment">Customer Payment</option>
            <option value="vendor_payment">Vendor Payment</option>
          </select>
          <input className="input" placeholder="Contact ID" value={contactId} onChange={(e)=>setContactId(e.target.value)} />
          <select className="input" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
          </select>
          <input className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference</th>
                <th>Balance</th>
                <th>Allocate</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.target_type}</td>
                  <td>{r.ref || r.target_id}</td>
                  <td>{r.balance ?? '-'}</td>
                  <td><input type="number" step="0.01" className="input w-28" value={r.amount} onChange={(e)=>updateRow(idx,'amount',e.target.value)} /></td>
                  <td><button className="text-red-600" onClick={()=>removeRow(idx)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Pending Invoices</h4>
            <div className="max-h-64 overflow-auto border rounded">
              {(invData?.results || invData || []).filter((i)=>Number(i.balance_due)>0).map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-3 py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">{inv.invoice_number}</div>
                    <div className="text-xs text-gray-500">Due ₹{inv.balance_due}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={()=>addRow({ target_type:'invoice', target_id: inv.id, ref: inv.invoice_number, balance: inv.balance_due, amount: inv.balance_due })}>Add</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Pending Bills</h4>
            <div className="max-h-64 overflow-auto border rounded">
              {(billData?.results || billData || []).filter((b)=>Number(b.balance_due)>0).map(bill => (
                <div key={bill.id} className="flex items-center justify-between px-3 py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">{bill.bill_number}</div>
                    <div className="text-xs text-gray-500">Due ₹{bill.balance_due}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={()=>addRow({ target_type:'bill', target_id: bill.id, ref: bill.bill_number, balance: bill.balance_due, amount: bill.balance_due })}>Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button className="btn btn-primary" onClick={()=>{
            if (!rows.length) { toast.error('Add allocations'); return; }
            createPayment.mutate();
          }}>Allocate Payments</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
