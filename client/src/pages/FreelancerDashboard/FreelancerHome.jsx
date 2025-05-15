import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { getFreelancerDashboardStats } from '../../services/apiRoutes';
import WelcomeBanner from '../../components/WelcomeBanner';
import { useAuth } from '../../context/AuthContext';


const FreelancerHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await getFreelancerDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching freelancer dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center mt-5">No data available.</div>;
  }

  return (
    <Row className="mt-4 g-4">
      <WelcomeBanner name={currentUser?.name || 'User'} />
      <Col md={6} xl={3}>
        <Card border="primary" className="text-center shadow-sm">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Active Jobs</Card.Subtitle>
            <Card.Title>{stats.activeJobs}</Card.Title>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} xl={3}>
        <Card border="success" className="text-center shadow-sm">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Completed Jobs</Card.Subtitle>
            <Card.Title>{stats.completedJobs}</Card.Title>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} xl={3}>
        <Card border="warning" className="text-center shadow-sm">
          <Card.Body>
            <Card.Subtitle className="mb-2 text-muted">Pending Proposals</Card.Subtitle>
            <Card.Title>{stats.pendingProposals}</Card.Title>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} xl={3}>
        <Card border="info" className="text-center shadow-sm">
        <Card.Body>
          <Card.Subtitle className="mb-2 text-muted">Total Earnings</Card.Subtitle>
          <Card.Title>
          ₹{stats?.totalEarnings != null ? stats.totalEarnings.toFixed(2) : '0.00'}
          </Card.Title>
        </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default FreelancerHome;
