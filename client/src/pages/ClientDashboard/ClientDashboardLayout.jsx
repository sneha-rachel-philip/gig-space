import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';
import '../../styles/ClientDashboardLayout.css'; 
const ClientDashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar role="client" className="sidebar" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientDashboardLayout;
