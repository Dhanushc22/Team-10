import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const BalanceSheet = () => {
  const [asOf, setAsOf] = useState('');
  const { data } = useQuery(['balance-sheet', asOf], () => reportsAPI.getBalanceSheet({ params: asOf ? { as_of_date: asOf } : {} }).then(r => r.data));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">View your financial position</p>
          <input type="date" className="input" value={asOf} onChange={(e)=>setAsOf(e.target.value)} />
        </div>
      </div>
      
      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data?.data || []).map((row, idx) => (
              <tr key={idx} className={row.is_total ? 'bg-gray-50 font-semibold' : ''}>
                <td className="px-4 py-2">{row.account_name}</td>
                <td className="px-4 py-2 capitalize">{row.account_type.replace('_',' ')}</td>
                <td className="px-4 py-2 text-right">₹{Number(row.balance).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-600">Balanced: {String(data?.is_balanced)}</div>
    </div>
  );
};

export default BalanceSheet;
