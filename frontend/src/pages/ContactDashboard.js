import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FileText, 
  CreditCard, 
  Download, 
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { transactionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ContactDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices');

  // Fetch user's invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery(
    'contact-user-invoices',
    transactionsAPI.getContactUserInvoices,
    {
      enabled: activeTab === 'invoices',
    }
  );

  // Fetch user's bills
  const { data: billsData, isLoading: billsLoading } = useQuery(
    'contact-user-bills',
    transactionsAPI.getContactUserBills,
    {
      enabled: activeTab === 'bills',
    }
  );

  const invoices = invoicesData?.data || [];
  const bills = billsData?.data || [];

  const handlePayNow = (invoice) => {
    // In a real app, this would integrate with a payment gateway
    alert(`Payment gateway integration for Invoice ${invoice.invoice_number}`);
  };

  const handleDownloadInvoice = (invoice) => {
    // In a real app, this would generate and download the invoice PDF
    alert(`Downloading Invoice ${invoice.invoice_number}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="status-badge status-paid">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge status-pending">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="status-badge status-overdue">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="status-badge status-draft">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.first_name}! Manage your invoices and bills.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Invoices</h3>
          <p className="text-3xl font-bold text-blue-600">{invoices.length}</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Paid Invoices</h3>
          <p className="text-3xl font-bold text-green-600">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pending Invoices</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {invoices.filter(inv => inv.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            My Invoices
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bills'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            My Bills
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'invoices' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Invoices</h3>
            <p className="text-gray-600">View and manage your invoices</p>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoicesLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="text-gray-600">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="font-medium text-gray-900">
                        ₹{invoice.grand_total?.toLocaleString()}
                      </td>
                      <td>
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          {invoice.status === 'paid' ? (
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="btn btn-secondary text-sm flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePayNow(invoice)}
                              className="btn btn-primary text-sm flex items-center"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => alert(`View Invoice ${invoice.invoice_number}`)}
                            className="btn btn-secondary text-sm flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Bills</h3>
            <p className="text-gray-600">View your vendor bills</p>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billsLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="font-medium text-gray-900">
                        {bill.bill_number}
                      </td>
                      <td className="text-gray-600">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="font-medium text-gray-900">
                        ₹{bill.grand_total?.toLocaleString()}
                      </td>
                      <td>
                        {getStatusBadge(bill.status)}
                      </td>
                      <td>
                        <button
                          onClick={() => alert(`View Bill ${bill.bill_number}`)}
                          className="btn btn-secondary text-sm flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal Placeholder */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 hidden" id="payment-modal">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button className="btn btn-primary flex-1">
                  Pay Now
                </button>
                <button className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDashboard;
