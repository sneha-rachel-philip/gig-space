import React from 'react';
import SidebarUser from '../../components/SidebarUser';
import { Outlet } from 'react-router-dom';
import '../../styles/ClientDashboardLayout.css'; 
const FreelancerDashboardLayout = () => {
  const userRole = 'freelancer'; 

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
export default FreelancerDashboardLayout;
