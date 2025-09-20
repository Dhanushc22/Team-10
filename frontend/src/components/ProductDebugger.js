import React, { useState } from 'react';
import AsyncProductSelect from './AsyncProductSelect';
import EnhancedAsyncProductSelect from './EnhancedAsyncProductSelect';

const ProductDebugger = () => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productDetails, setProductDetails] = useState({});
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const handleProductChange = (productId) => {
    addLog(`Product ID changed to: ${productId}`);
    setSelectedProductId(productId);
  };

  const handleProductDetails = (details) => {
    addLog(`Product details received: ${JSON.stringify(details)}`);
    setProductDetails(details);
  };

  const clearLog = () => {
    setDebugLog([]);
    setSelectedProductId('');
    setProductDetails({});
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">🔧 Product Selection Debugger</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enhanced Product Selection (with debugging)</label>
          <EnhancedAsyncProductSelect
            value={selectedProductId}
            onChange={handleProductChange}
            onProductDetails={handleProductDetails}
            transactionType="sales"
            placeholder="Type 'Sofa' to test..."
            required={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Regular Product Selection</label>
          <AsyncProductSelect
            value={selectedProductId}
            onChange={handleProductChange}
            onProductDetails={handleProductDetails}
            transactionType="sales"
            placeholder="Type 'Sofa' to test..."
            required={true}
          />
        </div>
      </div>
      
      <div className="bg-white border rounded p-3 mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Current State</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Selected Product ID:</strong> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${selectedProductId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {selectedProductId || 'None'}
              </span>
            </div>
            <div className="text-sm">
              <strong>Product Name:</strong> {productDetails.name || 'Not set'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Price:</strong> ₹{productDetails.price || 0}
            </div>
            <div className="text-sm">
              <strong>Tax %:</strong> {productDetails.tax_percent || 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-700">Debug Log</h4>
          <button 
            onClick={clearLog}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Clear Log
          </button>
        </div>
        <div className="bg-white border rounded p-2 max-h-40 overflow-y-auto">
          {debugLog.length === 0 ? (
            <div className="text-xs text-gray-500">No activity yet. Try selecting a product above.</div>
          ) : (
            debugLog.map((log, idx) => (
              <div key={idx} className="text-xs text-gray-700 font-mono border-b pb-1 mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        <strong>Instructions:</strong>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Type "Sofa" in the search field above</li>
          <li>Wait for dropdown to appear</li>
          <li>Click on the Sofa option</li>
          <li>Check if Product ID gets set correctly</li>
          <li>Look at the debug log and browser console (F12)</li>
        </ol>
      </div>
    </div>
  );
};

export default ProductDebugger;
