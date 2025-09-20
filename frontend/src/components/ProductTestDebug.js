import React, { useState, useEffect } from 'react';
import { masterDataAPI } from '../services/api';

const ProductTestDebug = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const testProductAPI = async (search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing Product API with search:', search);
      const params = search ? { search, page_size: 10 } : { page_size: 10 };
      const response = await masterDataAPI.getProducts(params);
      
      console.log('✅ Full API Response:', response);
      console.log('📊 Response Data:', response.data);
      
      const productList = response.data.results || response.data || [];
      setProducts(productList);
      
      console.log('🎯 Extracted Products:', productList);
      
    } catch (err) {
      console.error('❌ Product API Error:', err);
      console.error('📋 Error Response:', err.response);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testProductAPI();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    testProductAPI(searchTerm);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">🧪 Product API Debug Test</h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products (leave empty for all)"
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <div className="text-sm">
          <strong>Status:</strong> {loading ? '🔄 Loading...' : error ? '❌ Error' : '✅ Success'}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="text-sm">
          <strong>Products Found:</strong> {products.length}
        </div>
        
        {products.length > 0 && (
          <div className="bg-white border rounded p-2 max-h-40 overflow-y-auto">
            <div className="text-xs text-gray-600 mb-2">Products:</div>
            {products.map((product, idx) => (
              <div key={product.id} className="text-xs border-b pb-1 mb-1">
                <strong>#{product.id}</strong> {product.name} ({product.type}) - 
                Sales: ₹{product.sales_price} | Purchase: ₹{product.purchase_price}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        💡 Check the browser console for detailed API logs
      </div>
    </div>
  );
};

export default ProductTestDebug;
