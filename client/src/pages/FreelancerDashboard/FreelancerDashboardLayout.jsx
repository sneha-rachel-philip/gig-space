import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';

const FreelancerDashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="freelancer"/>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default FreelancerDashboardLayout;
