import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI, masterDataAPI } from '../../services/api';

const PartnerLedger = () => {
  const [selectedPartner, setSelectedPartner] = useState('');
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch contacts for partner selection
  const { data: contacts } = useQuery(
    'contacts', 
    () => masterDataAPI.getContacts().then(r => r.data),
    { retry: 1 }
  );

  // Fetch partner ledger data
  const { data, isLoading, error, refetch } = useQuery(
    ['partner-ledger', selectedPartner, fromDate, toDate], 
    () => selectedPartner ? reportsAPI.getPartnerLedger({ 
      partner_id: selectedPartner,
      from_date: fromDate,
      to_date: toDate 
    }).then(r => r.data) : Promise.resolve(null),
    {
      enabled: !!selectedPartner,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Get selected partner name
  const selectedPartnerName = selectedPartner ? 
    contacts?.data?.find(c => c.id === parseInt(selectedPartner))?.name || `Partner ${selectedPartner}` : 
    '';

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Ledger</h1>
          <p className="text-gray-600">Track individual partner transactions</p>
        </div>
        <div className="card p-6 bg-red-50 border border-red-200">
          <div className="text-red-800">
            <h3 className="font-semibold">Error Loading Partner Ledger</h3>
            <p className="text-sm">{error?.message || 'Failed to load partner ledger data'}</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Partner Ledger</h1>
        <p className="text-gray-600">Track individual partner transactions</p>
      </div>
      
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Partner</label>
            <select 
              className="input w-full" 
              value={selectedPartner} 
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <option value="">Choose a partner...</option>
              {(contacts?.data || []).map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.contact_type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input 
              type="date" 
              className="input w-full" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input 
              type="date" 
              className="input w-full" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!selectedPartner || isLoading}
            >
              {isLoading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {!selectedPartner ? (
        <div className="card p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-lg font-medium mb-1">Select a Partner</h3>
            <p className="text-sm">Choose a partner from the dropdown above to view their ledger</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading partner ledger...</span>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="card p-4 bg-blue-50 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-blue-600 font-medium">Partner</div>
                <div className="text-lg font-bold text-blue-800">{selectedPartnerName}</div>
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Opening Balance</div>
                <div className={`text-lg font-bold ${parseFloat(data.opening_balance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{formatCurrency(data.opening_balance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Period Activity</div>
                <div className="text-lg font-bold text-blue-800">
                  {(data.transactions || []).length} transactions
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Closing Balance</div>
                <div className={`text-lg font-bold ${parseFloat(data.closing_balance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{formatCurrency(data.closing_balance)}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Opening Balance Row */}
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(fromDate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Opening Balance
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">-</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">-</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">-</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">₹{formatCurrency(data.opening_balance)}</td>
                  </tr>
                  
                  {/* Transaction Rows */}
                  {(data.transactions || []).map((txn, idx) => {
                    const isDebit = parseFloat(txn.debit || 0) > 0;
                    const isCredit = parseFloat(txn.credit || 0) > 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(txn.date)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{txn.transaction_type}</div>
                          {txn.description && (
                            <div className="text-sm text-gray-500">{txn.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{txn.reference || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          {isDebit ? (
                            <span className="text-red-600 font-medium">₹{formatCurrency(txn.debit)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isCredit ? (
                            <span className="text-green-600 font-medium">₹{formatCurrency(txn.credit)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${parseFloat(txn.running_balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{formatCurrency(txn.running_balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {(!data.transactions || data.transactions.length === 0) && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No transactions found for the selected period
                      </td>
                    </tr>
                  )}
                  
                  {/* Closing Balance Row */}
                  <tr className="bg-gray-100 font-medium">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(toDate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                        Closing Balance
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">-</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      ₹{formatCurrency(data.total_debit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      ₹{formatCurrency(data.total_credit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      ₹{formatCurrency(data.closing_balance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Period: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-lg font-medium mb-1">No Data Found</h3>
            <p className="text-sm">No ledger data available for the selected partner and period</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerLedger;
