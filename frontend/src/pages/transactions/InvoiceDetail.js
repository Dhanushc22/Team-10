import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { transactionsAPI } from '../../services/api';

const InvoiceDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(['invoice', id], () => transactionsAPI.getCustomerInvoice(id).then(r => r.data));

  // Helper function to safely format numbers
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load invoice</div>;

  const inv = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {inv.invoice_number}</h1>
          <p className="text-gray-600 mt-1">Generated on {new Date(inv.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            inv.status === 'paid' ? 'bg-green-100 text-green-800' : 
            inv.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {inv.status === 'paid' ? 'Paid' : 
             inv.status === 'partially_paid' ? 'Partially Paid' : 
             'Unpaid'}
          </div>
        </div>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Name</p>
              <p className="text-lg font-medium text-gray-900">{inv.customer_name || inv.customer?.name || 'N/A'}</p>
            </div>
            {inv.customer?.email && (
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{inv.customer.email}</p>
              </div>
            )}
            {inv.customer?.mobile && (
              <div>
                <p className="text-sm font-medium text-gray-600">Phone Number</p>
                <p className="text-gray-900">{inv.customer.mobile}</p>
              </div>
            )}
            {inv.customer?.address && (
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{inv.customer.address}</p>
              </div>
            )}
            {inv.customer?.gst_number && (
              <div>
                <p className="text-sm font-medium text-gray-600">GST Number</p>
                <p className="text-gray-900 font-mono text-sm">{inv.customer.gst_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoice Date</p>
              <p className="text-gray-900">{new Date(inv.invoice_date).toLocaleDateString()}</p>
            </div>
            {inv.due_date && (
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-gray-900">{new Date(inv.due_date).toLocaleDateString()}</p>
              </div>
            )}
            {inv.sales_order && (
              <div>
                <p className="text-sm font-medium text-gray-600">Related Sales Order</p>
                <p className="text-gray-900">{inv.sales_order}</p>
              </div>
            )}
            {inv.created_by_name && (
              <div>
                <p className="text-sm font-medium text-gray-600">Created By</p>
                <p className="text-gray-900">{inv.created_by_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Balance Due</p>
              <p className={`text-lg font-semibold ${parseFloat(inv.balance_due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{formatCurrency(inv.balance_due)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {inv.items && inv.items.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products & Services</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax %</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inv.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {item.product_name || item.product?.name || `Product ID: ${item.product}`}
                      </div>
                      {item.product?.sku && (
                        <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {item.product?.description || 'No description available'}
                      </div>
                      {item.product?.category && (
                        <div className="text-sm text-gray-500">Category: {item.product.category}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-gray-900">₹{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-4 text-right text-gray-900">{item.tax_percent}%</td>
                    <td className="px-4 py-4 text-right text-gray-900">₹{formatCurrency(item.tax_amount)}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">₹{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div></div> {/* Empty space for alignment */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal (Before Tax)</span>
              <span className="font-medium">₹{formatCurrency(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax Amount</span>
              <span className="font-medium">₹{formatCurrency(inv.tax_total)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-lg font-semibold text-gray-900">Grand Total</span>
              <span className="text-xl font-bold text-gray-900">₹{formatCurrency(inv.grand_total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-green-600">₹{formatCurrency((parseFloat(inv.grand_total) || 0) - (parseFloat(inv.balance_due) || 0))}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-lg font-semibold text-gray-900">Balance Due</span>
              <span className={`text-xl font-bold ${parseFloat(inv.balance_due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{formatCurrency(inv.balance_due)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button 
          onClick={() => window.print()} 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Print Invoice
        </button>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Invoices
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetail;


