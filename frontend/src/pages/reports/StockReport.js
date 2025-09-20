import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const StockReport = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data, isLoading, error, refetch } = useQuery(
    ['stock-report', asOfDate], 
    () => reportsAPI.getStockReport({ as_of_date: asOfDate }).then(r => r.data),
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

  const formatQuantity = (value) => {
    const num = parseFloat(value) || 0;
    return num.toString();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
          <p className="text-gray-600">Track your inventory levels</p>
        </div>
        <div className="card p-6 bg-red-50 border border-red-200">
          <div className="text-red-800">
            <h3 className="font-semibold">Error Loading Stock Report</h3>
            <p className="text-sm">{error?.message || 'Failed to load stock report data'}</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">Inventory levels as of</p>
          <input 
            type="date" 
            className="input" 
            value={asOfDate} 
            onChange={(e) => setAsOfDate(e.target.value)}
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
            <span className="ml-2 text-gray-600">Loading stock report...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchased</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(data?.data || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{row.product_name}</div>
                        {row.product_sku && (
                          <div className="text-sm text-gray-500">SKU: {row.product_sku}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                          {row.product_type || 'Product'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{formatQuantity(row.opening_quantity)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">+{formatQuantity(row.purchased_quantity)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">-{formatQuantity(row.sold_quantity)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${parseFloat(row.current_quantity) <= 0 ? 'text-red-600' : parseFloat(row.current_quantity) < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {formatQuantity(row.current_quantity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">₹{formatCurrency(row.average_cost)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">₹{formatCurrency(row.stock_value)}</td>
                    </tr>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No stock data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4 bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Products</div>
              <div className="text-2xl font-bold text-blue-700">{data?.total_products || 0}</div>
            </div>
            <div className="card p-4 bg-green-50 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Total Stock Value</div>
              <div className="text-2xl font-bold text-green-700">₹{formatCurrency(data?.total_stock_value)}</div>
            </div>
            <div className="card p-4 bg-yellow-50 border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Low Stock Items</div>
              <div className="text-2xl font-bold text-yellow-700">
                {(data?.data || []).filter(item => parseFloat(item.current_quantity) < 10 && parseFloat(item.current_quantity) > 0).length}
              </div>
            </div>
            <div className="card p-4 bg-red-50 border border-red-200">
              <div className="text-sm text-red-600 font-medium">Out of Stock</div>
              <div className="text-2xl font-bold text-red-700">
                {(data?.data || []).filter(item => parseFloat(item.current_quantity) <= 0).length}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Report Date: {new Date(asOfDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              Last Updated: {new Date().toLocaleString()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockReport;
