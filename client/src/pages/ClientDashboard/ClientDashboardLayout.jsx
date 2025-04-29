import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarUser from '../../components/SidebarUser';

const ClientDashboardLayout = () => {
  const userRole = 'client'; 

  return (
    <div className="d-flex">
      <SidebarUser role={userRole} />
      
      <div id="content" className="p-4">
        {/* Your main content */}
        <Outlet />
      </div>
    </div>
  );
};

export default ClientDashboardLayout;