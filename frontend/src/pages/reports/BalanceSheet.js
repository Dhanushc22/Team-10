import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const BalanceSheet = () => {
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]); // Default to today
  
  const { data, isLoading, error, refetch } = useQuery(
    ['balance-sheet', asOf], 
    () => reportsAPI.getBalanceSheet({ as_of_date: asOf }).then(r => r.data),
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
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">View your financial position</p>
        </div>
        <div className="card p-6 bg-red-50 border border-red-200">
          <div className="text-red-800">
            <h3 className="font-semibold">Error Loading Balance Sheet</h3>
            <p className="text-sm">{error?.message || 'Failed to load balance sheet data'}</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">View your financial position as of</p>
          <input 
            type="date" 
            className="input" 
            value={asOf} 
            onChange={(e) => setAsOf(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading balance sheet...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
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
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                        {row.account_type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${row.is_total ? 'text-blue-900 text-lg' : 'text-gray-900'}`}>
                        ₹{formatCurrency(row.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No account data available for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Report Date: {new Date(asOf).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-medium ${data?.is_balanced ? 'text-green-600' : 'text-red-600'}`}>
                Balance Status: {data?.is_balanced ? '✅ Balanced' : '❌ Not Balanced'}
              </div>
              <div className="text-sm text-gray-600">
                Total Accounts: {data?.data?.length || 0}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BalanceSheet;
