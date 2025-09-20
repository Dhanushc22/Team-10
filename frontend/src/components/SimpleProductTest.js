import React, { useState } from 'react';
import AsyncProductSelect from './AsyncProductSelect';

const SimpleProductTest = () => {
  const [productId, setProductId] = useState('');
  const [productDetails, setProductDetails] = useState({});
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('🧪 TEST:', message);
  };

  const handleProductChange = (id) => {
    addLog(`Product ID changed: "${id}" (type: ${typeof id})`);
    setProductId(id);
  };

  const handleProductDetails = (details) => {
    addLog(`Product details received: ${JSON.stringify(details)}`);
    setProductDetails(details);
  };

  const testDirectCall = () => {
    // Simulate what should happen when Sofa (ID: 2) is selected
    addLog('Testing direct call with Sofa data');
    handleProductChange(2);
    handleProductDetails({
      name: 'Sofa',
      type: 'goods',
      price: 45000,
      tax_percent: 12,
      hsn_code: '9401',
      category: 'furniture'
    });
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🧪 Simple Product Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Product Selection
          </label>
          <AsyncProductSelect
            value={productId}
            onChange={handleProductChange}
            onProductDetails={handleProductDetails}
            transactionType="sales"
            placeholder="Type 'Sofa' and click on it..."
            required={true}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={testDirectCall}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Test Direct Call
          </button>
          <button 
            onClick={() => { setProductId(''); setProductDetails({}); setLogs([]); }}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Clear All
          </button>
        </div>

        <div className="bg-white border rounded p-3">
          <div className="text-sm font-medium mb-2">Current State:</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Product ID:</strong> 
              <span className={`ml-1 px-2 py-1 rounded ${productId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {productId || 'None'}
              </span>
            </div>
            <div><strong>Name:</strong> {productDetails.name || 'None'}</div>
            <div><strong>Price:</strong> ₹{productDetails.price || 0}</div>
            <div><strong>Tax:</strong> {productDetails.tax_percent || 0}%</div>
          </div>
        </div>

        <div className="bg-gray-50 border rounded p-3 max-h-40 overflow-y-auto">
          <div className="text-sm font-medium mb-2">Activity Log:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm">No activity yet</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="text-xs font-mono text-gray-700 mb-1">{log}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="text-sm text-blue-800">
          <strong>Test Instructions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Type "Sofa" in the input above</li>
            <li>Wait for dropdown to show results</li>
            <li>Click on the Sofa option in the dropdown</li>
            <li>Check if the Product ID changes to "2"</li>
            <li>Compare with "Test Direct Call" button behavior</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SimpleProductTest;
