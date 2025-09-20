import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user, isContact } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Role-based navigation and access control
  React.useEffect(() => {
    const path = location.pathname;
    
    if (isContact) {
      // Contact users: Redirect to contact dashboard and restrict access
      if (path === '/dashboard' || path === '/invoicing-dashboard') {
        navigate('/contact-dashboard');
      }
      // Block admin-only routes
      if (path.startsWith('/admin/') || 
          path.includes('/master-data/') || 
          path.includes('/create') || 
          path.includes('/edit')) {
        navigate('/contact-dashboard');
      }
    } else if (user?.role === 'invoicing_user') {
      // Invoicing users: Redirect to invoicing dashboard
      if (path === '/dashboard') {
        navigate('/invoicing-dashboard');
      }
      // Block admin-only routes
      if (path.startsWith('/admin/')) {
        navigate('/invoicing-dashboard');
      }
    } else if (user?.role === 'admin') {
      // Admin users: Default to main dashboard (no restrictions)
      if (path === '/invoicing-dashboard' || path === '/contact-dashboard') {
        navigate('/dashboard');
      }
    }
  }, [user, isContact, location.pathname, navigate]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
