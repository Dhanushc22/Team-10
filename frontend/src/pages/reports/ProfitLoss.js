import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const ProfitLoss = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const { data } = useQuery(['profit-loss', start, end], () => reportsAPI.getProfitLoss({ params: { ...(start?{start_date:start}:{}) , ...(end?{end_date:end}:{}) } }).then(r => r.data));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profit & Loss</h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">View your income and expenses</p>
          <input type="date" className="input" value={start} onChange={(e)=>setStart(e.target.value)} />
          <span>to</span>
          <input type="date" className="input" value={end} onChange={(e)=>setEnd(e.target.value)} />
        </div>
      </div>
      
      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data?.data || []).map((row, idx) => (
              <tr key={idx} className={row.is_total ? 'bg-gray-50 font-semibold' : ''}>
                <td className="px-4 py-2">{row.account_name}</td>
                <td className="px-4 py-2 capitalize">{row.account_type.replace('_',' ')}</td>
                <td className="px-4 py-2 text-right">₹{Number(row.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-600">Net: ₹{Number(data?.net_profit || 0).toLocaleString()}</div>
    </div>
  );
};

export default ProfitLoss;
