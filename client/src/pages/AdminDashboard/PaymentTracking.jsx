import React, { useEffect, useState } from 'react';
import { 
  Accordion, 
  Button, 
  Spinner, 
  Badge, 
  Table, 
  Card, 
  Container, 
  Row, 
  Col, 
  Alert, 
  OverlayTrigger, 
  Tooltip,
  ProgressBar
} from 'react-bootstrap';
import { getGroupedMilestoneApprovals, approveMilestone } from '../../services/apiRoutes';
import { useNavigate } from 'react-router-dom';

const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [milestones, setMilestones] = useState({
    pending: [],
    awaitingPayments: [],
    completedPayments: [],
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchMilestones = async () => {
    try {
      setError(null);
      const { data } = await getGroupedMilestoneApprovals();
      setMilestones({
        pending: data.pending || [],
        awaitingPayments: data.awaitingPayments || [],
        completedPayments: data.completedPayments || [],
      });
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setError('Failed to load milestone data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleApprove = async (contractId, milestoneLabel) => {
    try {
      setApproving((prev) => ({ ...prev, [milestoneLabel]: true }));
      await approveMilestone(contractId, milestoneLabel);
      await fetchMilestones();
    } catch (error) {
      console.error('Approval failed:', error);
      setError('Failed to approve milestone. Please try again.');
    } finally {
      setApproving((prev) => ({ ...prev, [milestoneLabel]: false }));
    }
  };

  const calculatePaymentStatus = (approvedAt) => {
    const approvedDate = new Date(approvedAt);
    const now = new Date();
    const gracePeriod = 5;
    const daysSinceApproval = Math.floor((now - approvedDate) / (1000 * 60 * 60 * 24));
    const overdueBy = daysSinceApproval - gracePeriod;
    const daysLeft = gracePeriod - daysSinceApproval;

    return {
      overdueBy,
      daysLeft,
      progress: Math.max(0, Math.min(100, (daysLeft / gracePeriod) * 100))
    };
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="text-center p-5 shadow-sm">
          <Spinner animation="border" variant="primary" className="mx-auto" />
          <Card.Text className="mt-3">Loading milestone data...</Card.Text>
        </Card>
      </Container>
    );
  }

  const totalMilestones = milestones.pending.length + milestones.awaitingPayments.length + milestones.completedPayments.length;

  return (
    <Container fluid="lg" className="py-4">
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">Milestones & Payments</h2>
              <p className="text-muted mb-0">Manage job milestones and payment approvals</p>
            </Col>
            <Col xs="auto">
              <Button variant="outline-primary" onClick={fetchMilestones}>
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {totalMilestones === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <div className="mb-4">
              <i className="bi bi-clipboard-check" style={{ fontSize: '3rem' }}></i>
            </div>
            <Card.Title>No Milestones Found</Card.Title>
            <Card.Text className="text-muted">
              There are currently no milestones in the system to display.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm mb-3">
              <Card.Body>
                <h3 className="display-4 fw-bold text-primary">{milestones.pending.length}</h3>
                <Card.Text>Pending Approvals</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm mb-3">
              <Card.Body>
                <h3 className="display-4 fw-bold text-warning">{milestones.awaitingPayments.length}</h3>
                <Card.Text>Awaiting Payment</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm mb-3">
              <Card.Body>
                <h3 className="display-4 fw-bold text-success">{milestones.completedPayments.length}</h3>
                <Card.Text>Completed Payments</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Accordion defaultActiveKey="0" className="shadow-sm">
        {/* Pending Admin Approval */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <Badge bg="primary" pill className="me-2">
                {milestones.pending.length}
              </Badge>
              <span className="fw-bold">Pending Admin Approval</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            {milestones.pending.length === 0 ? (
              <Alert variant="light" className="m-3 border">
                <i className="bi bi-info-circle me-2"></i>
                No pending approvals at this time.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Milestone</th>
                      <th>Amount (₹)</th>
                      <th>Freelancer</th>
                      <th>Client</th>
                      <th>Job Title</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.pending.map((m, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{m.milestoneLabel}</td>
                        <td>₹{m.amount.toLocaleString()}</td>
                        <td>
                          <div className="fw-bold">{m.freelancer.name}</div>
                          <small className="text-muted">{m.freelancer.email}</small>
                        </td>
                        <td>
                          <div className="fw-bold">{m.client.name}</div>
                          <small className="text-muted">{m.client.email}</small>
                        </td>
                        <td>{m.jobTitle}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(m.contractId, m.milestoneLabel)}
                              disabled={approving[m.milestoneLabel]}
                            >
                              {approving[m.milestoneLabel] ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  <span>Approving</span>
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check2-circle me-1"></i>
                                  <span>Approve</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/job-area/${m.jobId}`)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              <span>View Job</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Awaiting Client Payment */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <Badge bg="warning" pill className="me-2">
                {milestones.awaitingPayments.length}
              </Badge>
              <span className="fw-bold">Awaiting Client Payment</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            {milestones.awaitingPayments.length === 0 ? (
              <Alert variant="light" className="m-3 border">
                <i className="bi bi-info-circle me-2"></i>
                No milestones awaiting payment.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Milestone</th>
                      <th>Amount (₹)</th>
                      <th>Freelancer/Client</th>
                      <th>Approved On</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.awaitingPayments.map((m, idx) => {
                      const { overdueBy, daysLeft, progress } = calculatePaymentStatus(m.approvedAt);
                      
                      return (
                        <tr key={idx} className={overdueBy > 0 ? "table-danger" : ""}>
                          <td className="fw-bold">{m.milestoneLabel}</td>
                          <td>₹{m.amount.toLocaleString()}</td>
                          <td>
                            <div className="d-flex flex-column gap-2">
                              <div>
                                <Badge bg="info" className="me-1">Freelancer</Badge>
                                <span className="fw-bold">{m.freelancer.name}</span>
                              </div>
                              <div>
                                <Badge bg="secondary" className="me-1">Client</Badge>
                                <span className="fw-bold">{m.client.name}</span>
                              </div>
                            </div>
                          </td>
                          <td>{new Date(m.approvedAt).toLocaleDateString()}</td>
                          <td>
                            {overdueBy <= 0 ? (
                              <div>
                                <div className="mb-1 small fw-bold">
                                  <i className="bi bi-clock me-1"></i>
                                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                </div>
                                <ProgressBar 
                                  now={progress} 
                                  variant={progress > 60 ? "success" : progress > 30 ? "warning" : "danger"} 
                                  style={{ height: "6px" }}
                                />
                              </div>
                            ) : (
                              <div className="text-danger">
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                <span>Overdue by {overdueBy} day{overdueBy !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>View job details</Tooltip>}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/job-area/${m.jobId}`)}
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Completed & Paid */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <Badge bg="success" pill className="me-2">
                {milestones.completedPayments.length}
              </Badge>
              <span className="fw-bold">Completed & Paid</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            {milestones.completedPayments.length === 0 ? (
              <Alert variant="light" className="m-3 border">
                <i className="bi bi-info-circle me-2"></i>
                No paid milestones yet.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Milestone</th>
                      <th>Amount (₹)</th>
                      <th>Freelancer/Client</th>
                      <th>Paid On</th>
                      <th>Contract Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.completedPayments.map((m, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold">{m.milestoneLabel}</td>
                        <td>₹{m.amount.toLocaleString()}</td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            <div>
                              <Badge bg="info" className="me-1">Freelancer</Badge>
                              <span className="fw-bold">{m.freelancer.name}</span>
                            </div>
                            <div>
                              <Badge bg="secondary" className="me-1">Client</Badge>
                              <span className="fw-bold">{m.client.name}</span>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(m.paidAt).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={m.contractStatus === "Completed" ? "success" : "secondary"} pill>
                            {m.contractStatus}
                          </Badge>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View job details</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/job-area/${m.jobId}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default JobManagement;