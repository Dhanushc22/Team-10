import React from 'react';
import { useQuery } from 'react-query';
import { transactionsAPI } from '../../services/api';

const VendorBill = () => {
  const { data: billData } = useQuery('vendor-bills', () => transactionsAPI.getVendorBills().then(r => r.data));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Bills</h1>
        <p className="text-gray-600">Manage vendor bills and payments</p>
      </div>
      

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
                <td className="px-4 py-2">
                  {bill.vendor_name || bill.vendor?.name || `Vendor ID: ${bill.vendor}`}
                </td>
                <td className="px-4 py-2">₹{bill.grand_total}</td>
                <td className="px-4 py-2">₹{bill.balance_due}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <a href={`/transactions/vendor-bills/${bill.id}`} className="px-3 py-1 bg-gray-100 rounded-md text-sm">View</a>
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
