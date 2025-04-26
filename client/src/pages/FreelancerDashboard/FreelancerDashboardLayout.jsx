import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';
import '../../styles/ClientDashboardLayout.css'; 
const FreelancerDashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar role="freelancer" className="sidebar" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default FreelancerDashboardLayout;
