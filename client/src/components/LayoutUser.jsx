// src/components/Layout.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import SidebarUser from './Sidebar';
import { useAuth } from '../context/AuthContext'; // Adjust the import path as necessary    

const LayoutUser = ({ requireAuth = true }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Show loading state if authentication is still being checked
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex">
      <SidebarUser role={userRole} />
      
      <div id="content" className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutUser;