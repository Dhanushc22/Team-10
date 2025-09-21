import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BookOpen,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  TrendingUp,
  Package2,
  UserCheck,
  LogOut,
  Settings,
  Shield,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout, isContact } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Admin and Invoicing User Navigation
  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Data', href: '#', icon: BookOpen, children: [
      { name: 'Contacts', href: '/master-data/contacts', icon: Users },
      { name: 'Products', href: '/master-data/products', icon: Package },
      { name: 'Chart of Accounts', href: '/master-data/chart-of-accounts', icon: BookOpen },
    ]},
    { name: 'Transactions', href: '#', icon: FileText, children: [
      { name: 'Purchase Orders', href: '/transactions/purchase-orders', icon: ShoppingCart },
      { name: 'Vendor Bills', href: '/transactions/vendor-bills', icon: FileText },
      { name: 'Sales Orders', href: '/transactions/sales-orders', icon: ShoppingCart },
      { name: 'Customer Invoices', href: '/transactions/customer-invoices', icon: FileText },
      { name: 'Payments', href: '/transactions/payments', icon: CreditCard },
    ]},
    { name: 'Reports', href: '#', icon: BarChart3, children: [
      { name: 'Balance Sheet', href: '/reports/balance-sheet', icon: TrendingUp },
      { name: 'Profit & Loss', href: '/reports/profit-loss', icon: BarChart3 },
      { name: 'Stock Report', href: '/reports/stock-report', icon: Package2 },
      { name: 'Partner Ledger', href: '/reports/partner-ledger', icon: UserCheck },
    ]},
    { name: 'Utilities', href: '#', icon: Settings, children: [
      { name: 'HSN Search', href: '/utilities/hsn-search', icon: Search },
    ]},
  ];

  // Admin Only Navigation
  const adminOnlyNavItems = [
    { name: 'Administration', href: '#', icon: Settings, children: [
      { name: 'User Management', href: '/admin/users', icon: Shield },
    ]},
  ];

  // Contact User Navigation
  const contactNavItems = [
    { name: 'My Dashboard', href: '/contact-dashboard', icon: LayoutDashboard },
    { name: 'My Invoices', href: '/contact-dashboard', icon: FileText },
    { name: 'My Bills', href: '/contact-dashboard', icon: FileText },
  ];

  const invoicingNavItems = [
    { name: 'Invoicing Dashboard', href: '/invoicing-dashboard', icon: LayoutDashboard },
    { name: 'Master Data', href: '#', icon: BookOpen, children: [
      { name: 'Contacts', href: '/master-data/contacts', icon: Users },
      { name: 'Products', href: '/master-data/products', icon: Package },
      { name: 'Chart of Accounts', href: '/master-data/chart-of-accounts', icon: BookOpen },
    ]},
    { name: 'Transactions', href: '#', icon: FileText, children: [
      { name: 'Customer Invoices', href: '/transactions/customer-invoices', icon: FileText },
      { name: 'Sales Orders', href: '/transactions/sales-orders', icon: ShoppingCart },
      { name: 'Vendor Bills', href: '/transactions/vendor-bills', icon: FileText },
      { name: 'Purchase Orders', href: '/transactions/purchase-orders', icon: ShoppingCart },
      { name: 'Payments', href: '/transactions/payments', icon: CreditCard },
    ]},
    { name: 'Reports', href: '#', icon: BarChart3, children: [
      { name: 'Balance Sheet', href: '/reports/balance-sheet', icon: TrendingUp },
      { name: 'Profit & Loss', href: '/reports/profit-loss', icon: BarChart3 },
      { name: 'Stock Report', href: '/reports/stock-report', icon: Package2 },
      { name: 'Partner Ledger', href: '/reports/partner-ledger', icon: UserCheck },
    ]},
    { name: 'Utilities', href: '#', icon: Settings, children: [
      { name: 'HSN Search', href: '/utilities/hsn-search', icon: Search },
      { name: 'HSN API Test', href: '/utilities/hsn-api-test', icon: Search },
    ]},
  ];

  // Determine navigation items based on user role
  let navItems;
  if (isContact) {
    navItems = contactNavItems;
  } else if (user?.role === 'admin') {
    navItems = [...adminNavItems, ...adminOnlyNavItems];
  } else if (user?.role === 'invoicing_user') {
    navItems = invoicingNavItems;
  } else {
    navItems = adminNavItems;
  }

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    if (item.children) {
      return (
        <div key={item.name} className="mb-2">
          <div className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
            <Icon className="h-5 w-5 mr-3" />
            {item.name}
          </div>
          <div className="ml-8 space-y-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = location.pathname === child.href;
              return (
                <NavLink
                  key={child.name}
                  to={child.href}
                  className={`sidebar-item ${isChildActive ? 'active' : ''}`}
                >
                  <ChildIcon className="h-4 w-4 mr-3" />
                  {child.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={`sidebar-item ${isActive ? 'active' : ''}`}
      >
        <Icon className="h-5 w-5 mr-3" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="sidebar w-64 h-screen flex flex-col relative">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Shiv Accounts</h1>
            <p className="text-xs text-gray-500">Cloud</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

      {/* User Info and Logout */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
