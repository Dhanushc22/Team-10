import React, { useState } from 'react';
import HSNSearchInput from '../components/HSNSearchInput';

const HSNSearchDemo = () => {
  const [selectedHSN, setSelectedHSN] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);

  const handleHSNSelect = (hsnData) => {
    setSelectedHSN(hsnData.hsn_code || hsnData.code || hsnData.hsnCode);
    setSelectedDetails(hsnData);
  };

  const handleHSNChange = (value) => {
    setSelectedHSN(value);
    if (!value) {
      setSelectedDetails(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">HSN Code Search</h1>
        <p className="text-gray-600">
          Search for HSN (Harmonized System of Nomenclature) codes for goods and services under Indian GST.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product HSN Search */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search for Products</h3>
          <HSNSearchInput
            type="product"
            placeholder="Enter product name or HSN code..."
            onSelect={handleHSNSelect}
            onChange={handleHSNChange}
            className="mb-4"
          />
          
          {selectedDetails && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-900 mb-2">Selected HSN Details:</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">HSN Code:</span> {selectedDetails.hsn_code || selectedDetails.code || selectedDetails.hsnCode}</div>
                <div><span className="font-medium">Description:</span> {selectedDetails.description || selectedDetails.desc || selectedDetails.hsnDescription}</div>
                {selectedDetails.gst_rate && (
                  <div><span className="font-medium">GST Rate:</span> {selectedDetails.gst_rate}%</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Service HSN Search */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search for Services</h3>
          <HSNSearchInput
            type="service"
            placeholder="Enter service description or SAC code..."
            onSelect={(serviceData) => {
              console.log('Selected service:', serviceData);
            }}
            className="mb-4"
          />
          
          <div className="text-sm text-gray-600">
            <p>Service Accounting Codes (SAC) are used for services under GST.</p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Furniture Business HSN Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="font-medium text-blue-900">Search by Code</div>
            <div className="text-blue-700 mt-1">Try: 9401, 9403, 4412</div>
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <div className="font-medium text-green-900">Search by Product</div>
            <div className="text-green-700 mt-1">Try: chair, furniture, wood</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-md">
            <div className="font-medium text-purple-900">Search by Service</div>
            <div className="text-purple-700 mt-1">Try: installation, design</div>
          </div>
        </div>
        
        {/* Common Furniture HSN Codes */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Common Furniture HSN Codes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>9401 - Chairs & Seats</span>
              <span className="text-blue-600">12% GST</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>9403 - Other Furniture</span>
              <span className="text-blue-600">12% GST</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>4412 - Plywood</span>
              <span className="text-blue-600">12% GST</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>8302 - Furniture Fittings</span>
              <span className="text-blue-600">18% GST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Code Example */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Example</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono overflow-x-auto">
          <pre>{`// Import the component
import HSNSearchInput from './components/HSNSearchInput';

// Use in your form
<HSNSearchInput
  type="product"
  placeholder="Search HSN code..."
  onSelect={(hsnData) => {
    setFormData({
      ...formData,
      hsnCode: hsnData.hsn_code,
      gstRate: hsnData.gst_rate
    });
  }}
  onChange={(value) => setHsnCode(value)}
/>`}</pre>
        </div>
      </div>
    </div>
  );
};

export default HSNSearchDemo;