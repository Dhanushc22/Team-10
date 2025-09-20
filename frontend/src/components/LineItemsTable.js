import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { masterDataAPI } from '../services/api';

const LineItemsTable = ({ items, setItems }) => {
  const [products, setProducts] = useState([]);

  // Fetch products for dropdown
  const { data: productsData } = useQuery('products', () => 
    masterDataAPI.getProducts().then(r => r.data)
  );

  useEffect(() => {
    if (productsData) {
      setProducts(productsData.results || productsData || []);
    }
  }, [productsData]);

  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };

    // Auto-populate product details when product is selected
    if (key === 'product_id' && value) {
      const selectedProduct = products.find(p => p.id.toString() === value.toString());
      if (selectedProduct) {
        next[idx] = {
          ...next[idx],
          product_name: selectedProduct.name,
          unit_price: selectedProduct.purchase_price || 0,
          tax_percent: selectedProduct.purchase_tax_percent || 0
        };
        
        // Trigger calculation after product selection
        const quantity = next[idx].quantity || 0;
        const unitPrice = selectedProduct.purchase_price || 0;
        const taxPercent = selectedProduct.purchase_tax_percent || 0;

        const subtotal = quantity * unitPrice;
        const taxAmount = (subtotal * taxPercent) / 100;
        const total = subtotal + taxAmount;

        next[idx] = {
          ...next[idx],
          product_name: selectedProduct.name,
          unit_price: unitPrice,
          tax_percent: taxPercent,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total: total
        };
      }
    }

    // Recalculate totals when quantity, unit_price, or tax_percent changes
    if (['quantity', 'unit_price', 'tax_percent', 'product_id'].includes(key)) {
      const quantity = parseFloat(next[idx].quantity) || 0;
      const unitPrice = parseFloat(next[idx].unit_price) || 0;
      const taxPercent = parseFloat(next[idx].tax_percent) || 0;

      const subtotal = quantity * unitPrice;
      const taxAmount = (subtotal * taxPercent) / 100;
      const total = subtotal + taxAmount;

      next[idx] = {
        ...next[idx],
        subtotal: subtotal,
        tax_amount: taxAmount,
        total: total
      };
    }

    setItems(next);
  };

  const addRow = () => setItems([...items, { 
    product_id: '', 
    product_name: '',
    quantity: 1, 
    unit_price: 0, 
    tax_percent: 0,
    subtotal: 0,
    tax_amount: 0,
    total: 0
  }]);

  const removeRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  // Calculate grand totals using real-time calculations
  const grandSubtotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const grandTaxAmount = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const taxPercent = parseFloat(item.tax_percent) || 0;
    const subtotal = quantity * unitPrice;
    return sum + ((subtotal * taxPercent) / 100);
  }, 0);

  const grandTotal = grandSubtotal + grandTaxAmount;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Tax %</th>
              <th>Without Tax</th>
              <th>With Tax</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              // Calculate real-time values for display
              const quantity = parseFloat(item.quantity) || 0;
              const unitPrice = parseFloat(item.unit_price) || 0;
              const taxPercent = parseFloat(item.tax_percent) || 0;
              
              const subtotal = quantity * unitPrice;
              const taxAmount = (subtotal * taxPercent) / 100;
              const total = subtotal + taxAmount;

              return (
              <tr key={idx}>
                <td>
                  <select 
                    className="input w-48" 
                    value={item.product_id} 
                    onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (ID: {product.id})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    className="input w-20" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} 
                    min="1"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input w-28" 
                    value={item.unit_price} 
                    onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} 
                    min="0"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input w-20" 
                    value={item.tax_percent} 
                    onChange={(e) => updateItem(idx, 'tax_percent', Number(e.target.value))} 
                    min="0"
                    max="100"
                  />
                </td>
                <td>
                  <div className="w-24 text-right font-medium">
                    ₹{subtotal.toFixed(2)}
                  </div>
                </td>
                <td>
                  <div className="w-24 text-right font-medium">
                    ₹{total.toFixed(2)}
                  </div>
                </td>
                <td>
                  <button 
                    type="button" 
                    className="text-red-600 hover:text-red-800 font-medium" 
                    onClick={() => removeRow(idx)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={addRow}
        >
          Add Line
        </button>

        {/* Grand Total Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal (Without Tax):</span>
              <span className="font-medium">₹{grandSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tax Amount:</span>
              <span className="font-medium">₹{grandTaxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-semibold">Grand Total (With Tax):</span>
              <span className="font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemsTable;


