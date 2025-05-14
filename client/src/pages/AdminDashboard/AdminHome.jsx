import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Alert, 
  Badge, 
  ProgressBar 
} from 'react-bootstrap';
import { getAdminDashboardStats } from '../../services/apiRoutes'; // Adjust path as needed

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getAdminDashboardStats();
      setStats(response.data);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('Failed to load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Optional: Set up auto-refresh interval
    const refreshInterval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  const StatCard = ({ title, value, variant, icon, trend }) => {
    // Determine trend indicator if provided
    const renderTrend = () => {
      if (!trend) return null;
      
      const { direction, percentage } = trend;
      const isUp = direction === 'up';
      
      return (
        <div className="mt-2">
          <small className={`d-flex align-items-center ${isUp ? 'text-success' : 'text-danger'}`}>
            <i className={`bi bi-arrow-${isUp ? 'up' : 'down'}`}></i>
            {percentage}% {isUp ? 'increase' : 'decrease'}
          </small>
        </div>
      );
    };

    return (
      <Card bg={variant} text="white" className="mb-3 shadow h-100">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">{title}</Card.Title>
            {icon && <i className={`bi bi-${icon} fs-4`}></i>}
          </div>
          <Card.Text className="fs-1 fw-bold mb-1">{value}</Card.Text>
          {renderTrend()}
        </Card.Body>
      </Card>
    );
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard data...</p>
      </Container>
    );
  }

return (
    <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Admin Dashboard</h2>
            <div>
                {loading && <Spinner animation="border" size="sm" className="me-2" />}
                <button 
                    onClick={handleRefresh} 
                    className="btn btn-outline-primary" 
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                </button>
            </div>
        </div>
        
        {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )}

        {stats && (
            <>
                <Row className="g-3">
                    <Col md={6} lg={3}>
                        <StatCard 
                            title="Open Jobs" 
                            value={stats.totalOpenJobs || 0} 
                            variant="primary" 
                            icon="briefcase"
                            trend={stats.openJobsTrend}
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <StatCard 
                            title="Active Users" 
                            value={stats.activeUsers || 0} 
                            variant="success" 
                            icon="people-fill"
                            trend={stats.activeUsersTrend}
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <StatCard 
                            title="Pending Payments" 
                            value={`₹${(stats.totalPendingPayments || 0).toLocaleString()}`} 
                            variant="warning" 
                            icon="credit-card"
                            trend={stats.pendingPaymentsTrend}
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <StatCard 
                            title="Pending Reviews" 
                            value={stats.pendingReviews || 0} 
                            variant="danger" 
                            icon="star-half"
                            trend={stats.pendingReviewsTrend}
                        />
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5 className="card-title">System Status</h5>
                                    <Badge bg="success">Online</Badge>
                                </div>
                                <div className="mt-3">
                                    <small className="text-muted d-block mb-1">Server Load</small>
                                    <ProgressBar now={stats.serverLoad || 45} label={`${stats.serverLoad || 45}%`} />
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-white text-muted small">
                                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </>
        )}
    </Container>
);
};

export default AdminHome;