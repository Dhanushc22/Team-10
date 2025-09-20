import React from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';

const StockReport = () => {
  const { data } = useQuery('stock-report', () => reportsAPI.getStockReport({}).then(r => r.data));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        <p className="text-gray-600">Track your inventory levels</p>
      </div>
      
      <div className="card p-0 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Opening</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Purchased</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data?.data || []).map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">{row.product_name}</td>
                <td className="px-4 py-2 capitalize">{row.product_type}</td>
                <td className="px-4 py-2 text-right">{row.opening_quantity}</td>
                <td className="px-4 py-2 text-right">{row.purchased_quantity}</td>
                <td className="px-4 py-2 text-right">{row.sold_quantity}</td>
                <td className="px-4 py-2 text-right">{row.current_quantity}</td>
                <td className="px-4 py-2 text-right">₹{Number(row.average_cost).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">₹{Number(row.stock_value).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-600">Total Stock Value: ₹{Number(data?.total_stock_value || 0).toLocaleString()} ({data?.total_products || 0} products)</div>
    </div>
  );
};

export default StockReport;
