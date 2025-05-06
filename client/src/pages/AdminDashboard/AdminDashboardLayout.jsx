// src/layouts/AdminDashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import SidebarUser from '../../components/SidebarUser';

const AdminDashboardLayout = () => {
  const userRole = 'admin';

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

export default AdminDashboardLayout;
