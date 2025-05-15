import React, { useEffect, useState } from 'react';
import { getClientDashboardStats } from '../../services/apiRoutes'; // Adjust path as needed
import { Card, Row, Col, Spinner } from 'react-bootstrap';

const ClientHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getClientDashboardStats();;
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching client dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Client Dashboard</h2>

      {/* Hiring Funnel Section */}
      <h5 className="text-muted mb-3">Hiring Statistics</h5>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Open Jobs</h6>
              <h3>{stats.openJobs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Pending Contracts</h6>
              <h3>{stats.pendingContracts}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Project Metrics Section */}
      <h5 className="text-muted mb-3">Project Metrics</h5>
      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Active Projects</h6>
              <h3>{stats.activeProjects}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Completed Projects</h6>
              <h3>{stats.completedProjects}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h6>Total Spending</h6>
              <h3>₹{stats.totalSpending}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientHome;
