import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge, 
  Spinner, 
  Alert,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { getPaymentsForUser, requestWithdrawal, getCurrentUser } from '../../services/apiRoutes';

const FreelancerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState({ show: false, message: '', variant: 'info' });

  // Fetch wallet balance from the current user's data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setWalletBalance(res.data.walletBalance);
      } catch (err) {
        console.error('Failed to fetch user', err);
        setWithdrawStatus({
          show: true,
          message: 'Failed to fetch user data. Please try again later.',
          variant: 'danger'
        });
      }
    };
    fetchUser();
  }, []);

  // Fetch payments for the logged-in freelancer
  const fetchPayments = async () => {
    try {
      const res = await getPaymentsForUser();
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
      setWithdrawStatus({
        show: true,
        message: 'Failed to fetch payments. Please try again later.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const availablePayments = payments.filter(p => p.status === 'completed');
  const withdrawnPayments = payments.filter(p => p.status === 'withdrawn');
  const totalAvailableAmount = availablePayments.reduce((sum, p) => sum + p.amount, 0);

  const handleWithdraw = async () => {
    if (!availablePayments.length) {
      setWithdrawStatus({
        show: true,
        message: 'No funds available for withdrawal.',
        variant: 'warning'
      });
      return;
    }

    try {
      setWithdrawStatus({
        show: true,
        message: 'Processing withdrawal request...',
        variant: 'info'
      });
      
      const res = await requestWithdrawal({
        paymentIds: availablePayments.map(p => p._id),
      });

      setWithdrawStatus({
        show: true,
        message: res.data.message || 'Withdrawal requested successfully!',
        variant: 'success'
      });
      
      setIsWithdrawn(true);
      fetchPayments();
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawStatus({
        show: true,
        message: 'Withdrawal failed. Please try again later.',
        variant: 'danger'
      });
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : '—';

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Payment Dashboard</h1>
          
          {withdrawStatus.show && (
            <Alert 
              variant={withdrawStatus.variant} 
              dismissible 
              onClose={() => setWithdrawStatus({ ...withdrawStatus, show: false })}
            >
              {withdrawStatus.message}
            </Alert>
          )}
          
          <Row>
            <Col lg={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Available Balance</Card.Title>
                  <Card.Text className="display-4 my-3">₹{totalAvailableAmount}</Card.Text>
                  <Button
                    variant={isWithdrawn ? "success" : "primary"}
                    size="lg"
                    onClick={handleWithdraw}
                    disabled={isWithdrawn || !availablePayments.length}
                    className="w-100"
                  >
                    {isWithdrawn ? 'Withdrawal Completed' : 'Withdraw Now'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Payment Statistics</Card.Title>
                  <Row className="text-center mt-3">
                    <Col>
                      <h3>{availablePayments.length}</h3>
                      <p className="text-muted">Pending Payments</p>
                    </Col>
                    <Col>
                      <h3>{withdrawnPayments.length}</h3>
                      <p className="text-muted">Withdrawn Payments</p>
                    </Col>
                    <Col>
                      <h3>₹{walletBalance}</h3>
                      <p className="text-muted">Wallet Balance</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Tabs defaultActiveKey="pending" className="mb-4">
        <Tab eventKey="pending" title="Pending Payments">
          <Card className="shadow-sm">
            <Card.Body>
              {availablePayments.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Milestone</th>
                      <th>Job Title</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Paid At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availablePayments.map(p => (
                      <tr key={p._id}>
                        <td>{p.milestoneLabel || '—'}</td>
                        <td>{p.contract?.job?.title || '—'}</td>
                        <td>{p.contract?.client?.name || '—'}</td>
                        <td className="fw-bold">₹{p.amount}</td>
                        <td>{formatDate(p.createdAt)}</td>
                        <td>
                          <Badge bg="success">Available</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No pending payments available.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="history" title="Withdrawal History">
          <Card className="shadow-sm">
            <Card.Body>
              {withdrawnPayments.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Milestone</th>
                      <th>Job Title</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Withdrawn At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawnPayments.map(p => (
                      <tr key={p._id}>
                        <td>{p.milestoneLabel || '—'}</td>
                        <td>{p.contract?.job?.title || '—'}</td>
                        <td>{p.contract?.client?.name || '—'}</td>
                        <td className="fw-bold">₹{p.amount}</td>
                        <td>{formatDate(p.updatedAt)}</td>
                        <td>
                          <Badge bg="secondary">Withdrawn</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No withdrawal history available.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <Card.Text className="text-muted small">
            <i className="bi bi-info-circle me-2"></i>
            Withdrawals are typically processed within 2-3 business days. For any payment issues, please contact support.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FreelancerPayments;