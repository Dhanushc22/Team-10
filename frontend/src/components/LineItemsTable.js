import React from 'react';
import AsyncProductSelect from './AsyncProductSelect';

const LineItemsTable = ({ items, setItems, transactionType = 'sales' }) => {
  // transactionType: 'sales' (for SO/Invoice) or 'purchase' (for PO/Bill)

  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };

    // Recalculate totals when quantity, unit_price, or tax_percent changes
    if (['quantity', 'unit_price', 'tax_percent'].includes(key)) {
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

  // Handle product selection from AsyncProductSelect
  const handleProductChange = (idx, productId) => {
    console.log(`🔄 LineItemsTable: Product ID changed for row ${idx}:`, productId, 'Type:', typeof productId);
    console.log(`📊 LineItemsTable: Current item before update:`, items[idx]);
    
    const next = [...items];
    next[idx] = { ...next[idx], product_id: productId };
    
    console.log(`✅ LineItemsTable: Updated item:`, next[idx]);
    console.log(`📋 LineItemsTable: Full updated array:`, next);
    
    setItems(next);
    
    // Verify state after update (using setTimeout to check after state update)
    setTimeout(() => {
      console.log(`🔍 LineItemsTable: State after update - item ${idx}:`, items[idx]);
      console.log(`🎯 LineItemsTable: product_id is now:`, items[idx]?.product_id);
    }, 100);
  };

  // Handle product details auto-fill from AsyncProductSelect
  const handleProductDetails = (idx, productDetails) => {
    console.log(`📝 Product details received for row ${idx}:`, productDetails);
    const next = [...items];
    const quantity = parseFloat(next[idx].quantity) || 0;
    const unitPrice = parseFloat(productDetails.price) || 0;
    const taxPercent = parseFloat(productDetails.tax_percent) || 0;

    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;

    const updatedItem = {
      ...next[idx],
      product_name: productDetails.name,
      unit_price: unitPrice,
      tax_percent: taxPercent,
      subtotal: subtotal,
      tax_amount: taxAmount,
      total: total
    };

    next[idx] = updatedItem;
    console.log(`✅ Updated item ${idx}:`, updatedItem);
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
      {/* Instructions for users */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-blue-800 font-medium">
            Add at least one product to create the order. Use "Add Line" to add more items.
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto" style={{ minHeight: '200px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Product Name <span className="text-red-500">*</span></th>
              <th>Qty <span className="text-red-500">*</span></th>
              <th>Unit Price <span className="text-red-500">*</span></th>
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

              const isRowIncomplete = !item.product_id || quantity <= 0 || unitPrice <= 0;
              const hasAnyData = item.product_id || quantity > 0 || unitPrice > 0;
              
              // Debug logging for each item render
              console.log(`🔍 LineItemsTable RENDER: Item ${idx}:`, {
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                isRowIncomplete,
                hasAnyData
              });
              
              return (
              <tr key={idx} className={isRowIncomplete && hasAnyData ? 'bg-red-50 border-l-4 border-red-400' : ''}>
                <td style={{ width: '250px' }}>
                  <AsyncProductSelect
                    value={item.product_id}
                    onChange={(productId) => handleProductChange(idx, productId)}
                    onProductDetails={(details) => handleProductDetails(idx, details)}
                    transactionType={transactionType}
                    placeholder="Search products..."
                    required={true}
                  />
                  {!item.product_id && hasAnyData && (
                    <div className="text-xs text-red-600 mt-1">
                      Product selection required 
                      <span className="font-mono ml-1">
                        (ID: "{item.product_id}", Type: {typeof item.product_id})
                      </span>
                    </div>
                  )}
                  
                  {/* Debug: Manual test button */}
                  <button 
                    onClick={() => handleProductChange(idx, 2)}
                    className="text-xs bg-yellow-200 hover:bg-yellow-300 px-1 py-0.5 rounded mt-1"
                    type="button"
                  >
                    Test Set ID=2
                  </button>
                </td>
                <td>
                  <input 
                    type="number" 
                    className={`input w-20 ${quantity <= 0 && hasAnyData ? 'border-red-300 bg-red-50' : ''}`}
                    value={item.quantity} 
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} 
                    min="1"
                  />
                  {quantity <= 0 && hasAnyData && (
                    <div className="text-xs text-red-600 mt-1">Qty must be > 0</div>
                  )}
                </td>
                <td>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`input w-28 ${unitPrice <= 0 && hasAnyData ? 'border-red-300 bg-red-50' : ''}`}
                    value={item.unit_price} 
                    onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} 
                    min="0"
                  />
                  {unitPrice <= 0 && hasAnyData && (
                    <div className="text-xs text-red-600 mt-1">Price required</div>
                  )}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          type="button" 
          className="btn btn-secondary flex-shrink-0" 
          onClick={addRow}
        >
          Add Line
        </button>

        {/* Grand Total Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border flex-shrink-0 min-w-[280px]">
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


