import React from 'react';

const LineItemsTable = ({ items, setItems }) => {
  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    setItems(next);
  };

  const addRow = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0, tax_percent: 0 }]);
  const removeRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax %</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>
                <input className="input w-28" value={it.product_id} onChange={(e)=>updateItem(idx,'product_id',e.target.value)} />
              </td>
              <td>
                <input type="number" className="input w-24" value={it.quantity} onChange={(e)=>updateItem(idx,'quantity',Number(e.target.value))} />
              </td>
              <td>
                <input type="number" step="0.01" className="input w-28" value={it.unit_price} onChange={(e)=>updateItem(idx,'unit_price',Number(e.target.value))} />
              </td>
              <td>
                <input type="number" step="0.01" className="input w-24" value={it.tax_percent} onChange={(e)=>updateItem(idx,'tax_percent',Number(e.target.value))} />
              </td>
              <td>
                <button type="button" className="text-red-600" onClick={()=>removeRow(idx)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn btn-secondary mt-3" onClick={addRow}>Add Line</button>
    </div>
  );
};

export default LineItemsTable;


