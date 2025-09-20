import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { masterDataAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Plus, Package, Tag, DollarSign, Percent, Hash } from 'lucide-react';

const EnhancedAsyncProductSelect = ({ 
  value, 
  onChange, 
  onProductDetails, 
  placeholder = 'Search products by name or ID...',
  required = false,
  disabled = false,
  transactionType = 'sales' // 'sales' or 'purchase' - affects price field used
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debugInfo, setDebugInfo] = useState([]);
  
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const addDebugInfo = (info) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${info}`]);
    console.log(`🔧 DEBUG: ${info}`);
  };

  // Search products with React Query
  const { data: searchResults = [], isLoading, error } = useQuery(
    ['products-search-enhanced', searchTerm],
    async () => {
      if (!searchTerm.trim()) {
        addDebugInfo('Empty search term, returning empty results');
        return [];
      }
      
      const params = { 
        search: searchTerm.trim(),
        page_size: 10
      };
      
      addDebugInfo(`Searching for: "${searchTerm}" with params: ${JSON.stringify(params)}`);
      
      try {
        const response = await masterDataAPI.getProducts(params);
        addDebugInfo(`API Response status: ${response.status}`);
        addDebugInfo(`Raw response data: ${JSON.stringify(response.data)}`);
        
        const results = response.data.results || response.data || [];
        addDebugInfo(`Extracted ${results.length} products`);
        
        if (results.length > 0) {
          addDebugInfo(`First product: ${results[0].name} (ID: ${results[0].id})`);
        }
        
        return results;
      } catch (err) {
        addDebugInfo(`API Error: ${err.message}`);
        if (err.response) {
          addDebugInfo(`Error status: ${err.response.status}`);
          addDebugInfo(`Error data: ${JSON.stringify(err.response.data)}`);
        }
        toast.error('Failed to search products. Check console for details.');
        throw err;
      }
    },
    {
      enabled: searchTerm.length > 0,
      staleTime: 5000, // Shorter cache for debugging
      retry: 1,
    }
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    addDebugInfo(`Input changed to: "${newValue}"`);
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    // If user clears the input, clear the selection
    if (!newValue) {
      addDebugInfo('Input cleared, clearing selection');
      onChange('');
      if (onProductDetails) {
        onProductDetails({ name: '', type: '', price: 0, tax_percent: 0, hsn_code: '', category: '' });
      }
    }
  };

  // Handle product selection
  const handleSelectProduct = (product) => {
    addDebugInfo(`Product selected: ${product.name} (ID: ${product.id})`);
    setSearchTerm(product.name);
    onChange(product.id);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onProductDetails) {
      const price = transactionType === 'sales' ? product.sales_price : product.purchase_price;
      const taxRate = transactionType === 'sales' ? product.sale_tax_percent : product.purchase_tax_percent;
      
      const productDetails = {
        name: product.name || '',
        type: product.type || '',
        price: price || 0,
        tax_percent: taxRate || 0,
        hsn_code: product.hsn_code || '',
        category: product.category || ''
      };
      
      addDebugInfo(`Sending product details: ${JSON.stringify(productDetails)}`);
      onProductDetails(productDetails);
    }
    
    addDebugInfo(`Selection complete. Product ID set to: ${product.id}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add effect to show when value changes
  useEffect(() => {
    addDebugInfo(`Value prop changed to: ${value}`);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="relative" ref={dropdownRef}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className={`input pl-10 pr-4 ${required && !value ? 'border-red-300' : ''}`}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-[999] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
               style={{ minWidth: '300px' }}>
            
            {/* Error Display */}
            {error && (
              <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-200">
                ⚠️ Error: {error.message}
              </div>
            )}
            
            {/* Debug Info */}
            <div className="px-4 py-2 text-xs text-gray-500 bg-yellow-50 border-b border-yellow-200">
              <div>🔧 Debug: {searchResults.length} results | Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Search: "{searchTerm}" | Value: {value || 'None'}</div>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    className={`px-4 py-3 cursor-pointer flex items-start space-x-3 ${
                      index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex-shrink-0">
                      {product.type === 'goods' ? (
                        <Package className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Tag className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">ID: {product.id}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ₹{transactionType === 'sales' ? product.sales_price : product.purchase_price}
                        </span>
                        <span className="flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {transactionType === 'sales' ? product.sale_tax_percent : product.purchase_tax_percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm && !isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No products found for "{searchTerm}"
              </div>
            ) : searchTerm && isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Searching products...</span>
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Start typing to search products...
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Debug Info Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs">
        <div className="font-medium text-gray-700 mb-1">Debug Log:</div>
        {debugInfo.length === 0 ? (
          <div className="text-gray-500">No activity yet</div>
        ) : (
          debugInfo.map((info, idx) => (
            <div key={idx} className="text-gray-600 font-mono">{info}</div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedAsyncProductSelect;
