import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const ProfitLoss = () => {
  // Set default dates to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [start, setStart] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [end, setEnd] = useState(today.toISOString().split('T')[0]);
  
  const { data, isLoading, error, refetch } = useQuery(
    ['profit-loss', start, end], 
    () => reportsAPI.getProfitLoss({ 
      start_date: start || undefined, 
      end_date: end || undefined 
    }).then(r => r.data),
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Helper function to safely format numbers
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss</h1>
          <p className="text-gray-600">View your income and expenses</p>
        </div>
        <div className="card p-6 bg-red-50 border border-red-200">
          <div className="text-red-800">
            <h3 className="font-semibold">Error Loading Profit & Loss</h3>
            <p className="text-sm">{error?.message || 'Failed to load profit & loss data'}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-gray-600">Period:</p>
          <input 
            type="date" 
            className="input" 
            value={start} 
            onChange={(e) => setStart(e.target.value)}
            max={end}
          />
          <span className="text-gray-500">to</span>
          <input 
            type="date" 
            className="input" 
            value={end} 
            onChange={(e) => setEnd(e.target.value)}
            min={start}
            max={new Date().toISOString().split('T')[0]}
          />
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Generating profit & loss report...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data?.data || []).map((row, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 ${row.is_total ? 'bg-blue-50 font-semibold border-t-2 border-blue-200' : ''}`}>
                    <td className="px-4 py-3">
                      <div className={row.is_total ? 'font-semibold text-blue-900' : 'text-gray-900'}>
                        {row.account_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        row.account_type === 'income' ? 'bg-green-100 text-green-800' : 
                        row.account_type === 'expense' ? 'bg-red-100 text-red-800' : 
                        row.account_type === 'net_profit' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.account_type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        row.is_total ? 'text-blue-900 text-lg' : 
                        row.account_type === 'income' ? 'text-green-600' : 
                        row.account_type === 'expense' ? 'text-red-600' : 
                        'text-gray-900'
                      }`}>
                        ₹{formatCurrency(row.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No transaction data available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 bg-green-50 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Total Income</div>
              <div className="text-2xl font-bold text-green-700">₹{formatCurrency(data?.total_income)}</div>
            </div>
            <div className="card p-4 bg-red-50 border border-red-200">
              <div className="text-sm text-red-600 font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-red-700">₹{formatCurrency(data?.total_expenses)}</div>
            </div>
            <div className={`card p-4 border ${parseFloat(data?.net_profit || 0) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`text-sm font-medium ${parseFloat(data?.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {parseFloat(data?.net_profit || 0) >= 0 ? 'Net Profit' : 'Net Loss'}
              </div>
              <div className={`text-2xl font-bold ${parseFloat(data?.net_profit || 0) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                ₹{formatCurrency(Math.abs(data?.net_profit || 0))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Period: {new Date(start).toLocaleDateString()} - {new Date(end).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              Total Entries: {data?.data?.length || 0}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLoss;
