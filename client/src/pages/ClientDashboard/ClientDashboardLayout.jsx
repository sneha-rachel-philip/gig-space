import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';
import '../../styles/ClientDashboardLayout.css'; // Assuming you have a CSS file for styling
//import '../../styles/Sidebar.css'; // Assuming you have a CSS file for styling
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
