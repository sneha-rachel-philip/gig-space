import React from 'react';
import SidebarUser from '../../components/SidebarUser';
import { Outlet } from 'react-router-dom';
import '../../styles/ClientDashboardLayout.css'; 
const FreelancerDashboardLayout = () => {
  const userRole = 'freelancer'; 

  return (
    <Container fluid className="px-0">
      <Row className="g-0">
        <Col xs="auto">
          <SidebarUser role={userRole} />
        </Col>
        
        <Col className="content-area">
          <Container fluid className="py-3">
            <Outlet />
          </Container>
        </Col>
      </Row>
    </Container>
  );
};
export default FreelancerDashboardLayout;
