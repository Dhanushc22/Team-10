import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user, isContact } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect contact users to their dashboard
  React.useEffect(() => {
    if (isContact && location.pathname === '/dashboard') {
      navigate('/contact-dashboard');
    }
  }, [isContact, location.pathname, navigate]);

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
