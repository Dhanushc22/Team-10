import React from 'react';
import { useQuery } from 'react-query';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  CreditCard,
  Users,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard-summary',
    reportsAPI.getDashboardSummary,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const data = dashboardData?.data || {};

  // Mock chart data - in real app, this would come from API
  const salesData = [
    { month: 'Jan', sales: 12000, purchases: 8000 },
    { month: 'Feb', sales: 15000, purchases: 10000 },
    { month: 'Mar', sales: 18000, purchases: 12000 },
    { month: 'Apr', sales: 22000, purchases: 15000 },
    { month: 'May', sales: 25000, purchases: 18000 },
    { month: 'Jun', sales: 28000, purchases: 20000 },
    { month: 'Jul', sales: 30000, purchases: 22000 },
  ];

  const kpiCards = [
    {
      title: 'Total Sales',
      value: `₹${data.total_sales?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Purchases',
      value: `₹${data.total_purchases?.toLocaleString() || '0'}`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Net Profit',
      value: `₹${data.net_profit?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Cash Balance',
      value: `₹${data.cash_balance?.toLocaleString() || '0'}`,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const summaryCards = [
    {
      title: 'Total Customers',
      value: data.total_customers || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Vendors',
      value: data.total_vendors || 0,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Total Products',
      value: data.total_products || 0,
      icon: Package,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Low Stock Items',
      value: data.low_stock_products || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's a summary of your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales vs Purchases</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Purchases"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
          <div className="space-y-4">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${card.bgColor} mr-3`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{card.title}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{card.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Invoices */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invoices</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-700">INV-2024-001</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹5,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-700">INV-2024-002</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹3,500</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-700">INV-2024-003</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹7,200</span>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">PAY-2024-001</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹2,500</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">PAY-2024-002</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹4,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">PAY-2024-003</span>
              </div>
              <span className="text-sm font-medium text-gray-900">₹1,800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
