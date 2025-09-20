import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { masterDataAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Plus, Package, Tag, DollarSign, Percent, Hash } from 'lucide-react';

const AsyncProductSelect = ({ 
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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search products with React Query
  const { data: searchResults = [], isLoading } = useQuery(
    ['products-search', debouncedSearch],
    () => {
      if (!debouncedSearch.trim()) return [];
      const params = { 
        search: debouncedSearch.trim(),
        page_size: 10
      };
      return masterDataAPI.getProducts(params).then(res => res.data.results || res.data || []);
    },
    {
      enabled: debouncedSearch.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Get product by ID for initial value
  const { data: selectedProduct } = useQuery(
    ['product-detail', value],
    () => masterDataAPI.getProduct(value).then(res => res.data),
    {
      enabled: !!value && !searchTerm,
      onSuccess: (product) => {
        if (onProductDetails) {
          const price = transactionType === 'sales' ? product.sales_price : product.purchase_price;
          const taxRate = transactionType === 'sales' ? product.sale_tax_percent : product.purchase_tax_percent;
          
          onProductDetails({
            name: product.name || '',
            type: product.type || '',
            price: price || 0,
            tax_percent: taxRate || 0,
            hsn_code: product.hsn_code || '',
            category: product.category || ''
          });
        }
      }
    }
  );

  // Quick Add Product Mutation
  const createProductMutation = useMutation(
    (productData) => masterDataAPI.createProduct(productData),
    {
      onSuccess: (response) => {
        const newProduct = response.data;
        toast.success(`Product "${newProduct.name}" created successfully`);
        
        // Update the form with new product
        onChange(newProduct.id);
        if (onProductDetails) {
          const price = transactionType === 'sales' ? newProduct.sales_price : newProduct.purchase_price;
          const taxRate = transactionType === 'sales' ? newProduct.sale_tax_percent : newProduct.purchase_tax_percent;
          
          onProductDetails({
            name: newProduct.name || '',
            type: newProduct.type || '',
            price: price || 0,
            tax_percent: taxRate || 0,
            hsn_code: newProduct.hsn_code || '',
            category: newProduct.category || ''
          });
        }
        
        // Clear search and close modals
        setSearchTerm(newProduct.name);
        setShowQuickAdd(false);
        setIsOpen(false);
        
        // Invalidate and refetch products
        queryClient.invalidateQueries(['products-search']);
        queryClient.invalidateQueries(['products']);
      },
      onError: (error) => {
        console.error('Product creation error:', error);
        toast.error(error?.response?.data?.error || 'Failed to create product');
      }
    }
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    // If user clears the input, clear the selection
    if (!newValue) {
      onChange('');
      if (onProductDetails) {
        onProductDetails({ name: '', type: '', price: 0, tax_percent: 0, hsn_code: '', category: '' });
      }
    }
  };

  // Handle product selection
  const handleSelectProduct = (product) => {
    setSearchTerm(product.name);
    onChange(product.id);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onProductDetails) {
      const price = transactionType === 'sales' ? product.sales_price : product.purchase_price;
      const taxRate = transactionType === 'sales' ? product.sale_tax_percent : product.purchase_tax_percent;
      
      onProductDetails({
        name: product.name || '',
        type: product.type || '',
        price: price || 0,
        tax_percent: taxRate || 0,
        hsn_code: product.hsn_code || '',
        category: product.category || ''
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    const totalOptions = searchResults.length + (searchResults.length === 0 && searchTerm ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectProduct(searchResults[selectedIndex]);
        } else if (searchResults.length === 0 && searchTerm) {
          setShowQuickAdd(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
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

  // Set initial search term from selected product
  useEffect(() => {
    if (selectedProduct && !searchTerm) {
      setSearchTerm(selectedProduct.name);
    }
  }, [selectedProduct, searchTerm]);

  return (
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
          onKeyDown={handleKeyDown}
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
                      {product.hsn_code && (
                        <span className="flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          {product.hsn_code}
                        </span>
                      )}
                    </div>
                    {product.category && (
                      <div className="mt-1 text-xs text-gray-500">
                        Category: {product.category}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            /* No Results - Show Quick Add Option */
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-500">
                No products found for "{searchTerm}"
              </div>
              <button
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-2 ${
                  selectedIndex === 0 ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setShowQuickAdd(true)}
              >
                <Plus className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">
                  Create "{searchTerm}" as new product
                </span>
              </button>
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

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddProductModal
          initialName={searchTerm}
          transactionType={transactionType}
          onClose={() => setShowQuickAdd(false)}
          onSubmit={(productData) => createProductMutation.mutate(productData)}
          isLoading={createProductMutation.isLoading}
        />
      )}
    </div>
  );
};

// Quick Add Product Modal Component
const QuickAddProductModal = ({ initialName, transactionType, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: initialName || '',
    type: 'goods',
    sales_price: '',
    purchase_price: '',
    sale_tax_percent: '18',
    purchase_tax_percent: '18',
    hsn_code: '',
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.type) newErrors.type = 'Product type is required';
    if (!formData.sales_price || isNaN(formData.sales_price) || parseFloat(formData.sales_price) < 0) {
      newErrors.sales_price = 'Valid sales price is required';
    }
    if (!formData.purchase_price || isNaN(formData.purchase_price) || parseFloat(formData.purchase_price) < 0) {
      newErrors.purchase_price = 'Valid purchase price is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert string numbers to numbers
    const submitData = {
      ...formData,
      sales_price: parseFloat(formData.sales_price),
      purchase_price: parseFloat(formData.purchase_price),
      sale_tax_percent: parseFloat(formData.sale_tax_percent || 0),
      purchase_tax_percent: parseFloat(formData.purchase_tax_percent || 0),
    };

    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Add Product</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                className={`input ${errors.name ? 'border-red-300' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type *
              </label>
              <select
                className={`input ${errors.type ? 'border-red-300' : ''}`}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={isLoading}
              >
                <option value="goods">Goods</option>
                <option value="service">Service</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.sales_price ? 'border-red-300' : ''}`}
                  value={formData.sales_price}
                  onChange={(e) => handleChange('sales_price', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                {errors.sales_price && <p className="text-red-500 text-xs mt-1">{errors.sales_price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.purchase_price ? 'border-red-300' : ''}`}
                  value={formData.purchase_price}
                  onChange={(e) => handleChange('purchase_price', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                {errors.purchase_price && <p className="text-red-500 text-xs mt-1">{errors.purchase_price}</p>}
              </div>
            </div>

            {/* Tax Rates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Tax %
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input"
                  value={formData.sale_tax_percent}
                  onChange={(e) => handleChange('sale_tax_percent', e.target.value)}
                  placeholder="18"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Tax %
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input"
                  value={formData.purchase_tax_percent}
                  onChange={(e) => handleChange('purchase_tax_percent', e.target.value)}
                  placeholder="18"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* HSN Code and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.hsn_code}
                  onChange={(e) => handleChange('hsn_code', e.target.value)}
                  placeholder="12345678"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="Furniture"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input"
                rows={2}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description..."
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsyncProductSelect;
