import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../services/api';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [converting, setConverting] = useState(false);
  
  const { data, isLoading, error } = useQuery(['purchase-order', id], () => transactionsAPI.getPurchaseOrder(id).then(r => r.data));

  // Mutation for converting PO to Bill
  const convertToBillMutation = useMutation(
    () => transactionsAPI.convertPurchaseOrderToBill(id),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('vendor-bills');
        queryClient.invalidateQueries(['purchase-order', id]);
        alert('Purchase Order successfully converted to Vendor Bill!');
        // Navigate to the created bill
        navigate(`/transactions/vendor-bills/${response.data.id}`);
      },
      onError: (error) => {
        console.error('Conversion failed:', error);
        alert('Failed to convert Purchase Order to Bill. Please try again.');
      },
      onSettled: () => {
        setConverting(false);
      }
    }
  );

  const handleConvertToBill = () => {
    if (window.confirm('Are you sure you want to convert this Purchase Order to a Vendor Bill?')) {
      setConverting(true);
      convertToBillMutation.mutate();
    }
  };

  // Helper function to safely format numbers
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load purchase order</div>;

  const po = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order {po.po_number}</h1>
          <p className="text-gray-600 mt-1">Created on {new Date(po.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            po.status === 'delivered' ? 'bg-green-100 text-green-800' : 
            po.status === 'partially_delivered' ? 'bg-yellow-100 text-yellow-800' : 
            po.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {po.status === 'delivered' ? 'Delivered' : 
             po.status === 'partially_delivered' ? 'Partially Delivered' : 
             po.status === 'confirmed' ? 'Confirmed' :
             po.status === 'draft' ? 'Draft' : 'Pending'}
          </div>
        </div>
      </div>

      {/* Vendor & PO Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendor Name</p>
              <p className="text-lg font-medium text-gray-900">{po.vendor_name || po.vendor?.name || 'N/A'}</p>
            </div>
            {po.vendor?.email && (
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{po.vendor.email}</p>
              </div>
            )}
            {po.vendor?.mobile && (
              <div>
                <p className="text-sm font-medium text-gray-600">Phone Number</p>
                <p className="text-gray-900">{po.vendor.mobile}</p>
              </div>
            )}
            {po.vendor?.address && (
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{po.vendor.address}</p>
              </div>
            )}
            {po.vendor?.gst_number && (
              <div>
                <p className="text-sm font-medium text-gray-600">GST Number</p>
                <p className="text-gray-900 font-mono text-sm">{po.vendor.gst_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Order Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">PO Date</p>
              <p className="text-gray-900">{new Date(po.po_date).toLocaleDateString()}</p>
            </div>
            {po.delivery_date && (
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Delivery Date</p>
                <p className="text-gray-900">{new Date(po.delivery_date).toLocaleDateString()}</p>
              </div>
            )}
            {po.created_by_name && (
              <div>
                <p className="text-sm font-medium text-gray-600">Created By</p>
                <p className="text-gray-900">{po.created_by_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Order Status</p>
              <p className="text-gray-900 capitalize">{po.status || 'Draft'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {po.items && po.items.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ordered Products</h3>
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
                {po.items.map((item, idx) => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal (Before Tax)</span>
              <span className="font-medium">₹{formatCurrency(po.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax Amount</span>
              <span className="font-medium">₹{formatCurrency(po.tax_total)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-lg font-semibold text-gray-900">Grand Total</span>
              <span className="text-xl font-bold text-gray-900">₹{formatCurrency(po.grand_total)}</span>
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
          Print PO
        </button>
        
        {/* Convert to Bill Button */}
        <button 
          onClick={handleConvertToBill}
          disabled={converting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
          {converting ? 'Converting...' : 'Convert to Bill'}
        </button>
        
        <button 
          onClick={() => navigate('/transactions/purchase-orders')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Purchase Orders
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;