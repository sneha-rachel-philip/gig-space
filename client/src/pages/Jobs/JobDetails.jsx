import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJobById,
  getCurrentUser,
  applyForJob,
  deleteJob,
  closeJob,
  submitProposal,
} from '../../services/apiRoutes';
import '../../styles/JobDetails.css';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Row, 
  Col, 
  ListGroup, 
  Badge, 
  Alert,
  Accordion,
  Spinner,
  Image
} from "react-bootstrap";
import Layout from '../../components/Layout';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Proposal state
  const [proposalText, setProposalText] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch job and user data simultaneously
        const [jobResponse, userResponse] = await Promise.all([
          getJobById(id),
          getCurrentUser()
        ]);
        
        setJob(jobResponse.data);
        setUserRole(userResponse.data.role);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJobAction = async (action) => {
    try {
      switch(action) {
        case 'apply':
          await applyForJob(id);
          setSubmitMessage('Successfully applied for the job!');
          setSubmitStatus('success');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this job?')) {
            await deleteJob(id);
            navigate(userRole === 'admin' ? '/admin/jobs' : '/client/dashboard');
          }
          break;
        case 'close':
          if (window.confirm('Are you sure you want to close this job posting?')) {
            await closeJob(id);
            setJob({...job, status: 'closed'});
            setSubmitMessage('Job closed successfully!');
            setSubmitStatus('success');
          }
          break;
        case 'edit':
          navigate(`/${userRole}/edit-job/${id}`);
          break;
        default:
          console.error('Unknown action:', action);
      }
    } catch (error) {
      console.error(`Error performing action (${action}):`, error);
      setSubmitMessage(`Failed to ${action} the job. Please try again.`);
      setSubmitStatus('danger');
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setSubmitStatus(null);
      setSubmitMessage('Submitting proposal...');
      
      const response = await submitProposal({
        jobId: id,
        proposalText,
        proposedBudget,
        proposedDuration,
      });
      
      setSubmitMessage('Proposal submitted successfully!');
      setSubmitStatus('success');
      
      // Clear form fields after successful submission
      setProposalText('');
      setProposedBudget('');
      setProposedDuration('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit proposal.';
      setSubmitMessage(errorMessage);
      setSubmitStatus('danger');
    }
  };
  
  if (loading) return (
    <Layout>
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading job details...</p>
      </Container>
    </Layout>
  );

  if (error) return (
    <Layout>
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    </Layout>
  );

  if (!job) return (
    <Layout>
      <Container className="py-5">
        <Alert variant="warning">Job not found.</Alert>
      </Container>
    </Layout>
  );

  // Format dates for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return 'success';
      case 'in-progress': return 'primary';
      case 'completed': return 'info';
      case 'closed': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <Layout>
      <Container className="py-5">
        {/* Status Banner */}
        <div className="d-flex justify-content-end mb-3">
          <Badge 
            bg={getStatusBadge(job.status)} 
            className="p-2"
            style={{ fontSize: '1rem' }}
          >
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>

        {/* Main Job Details Card */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0">{job.title}</h2>
              <Badge bg="primary" className="px-3 py-2">${job.budget}</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col md={8}>
                <h5 className="text-secondary mb-3">Job Description</h5>
                <p>{job.description}</p>
              </Col>
              <Col md={4}>
                <Card className="bg-light">
                  <Card.Body>
                    <h6 className="mb-3">Project Details</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="bg-light ps-0">
                        <strong>Budget:</strong> ${job.budget}
                      </ListGroup.Item>
                      <ListGroup.Item className="bg-light ps-0">
                        <strong>Deadline:</strong> {formatDate(job.completedBy)}
                      </ListGroup.Item>
                      <ListGroup.Item className="bg-light ps-0">
                        <strong>Posted:</strong> {formatDate(job.createdAt)}
                      </ListGroup.Item>
                      <ListGroup.Item className="bg-light ps-0">
                        <strong>Category:</strong> {job.category}
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Skills Section */}
            <div className="mb-4">
              <h5 className="text-secondary mb-3">Skills Required</h5>
              <div>
                {job.skillsRequired?.map((skill, index) => (
                  <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Milestones Section */}
            {job.milestones && job.milestones.length > 0 && (
              <div className="mb-4">
                <h5 className="text-secondary mb-3">Project Milestones</h5>
                <ListGroup>
                  {job.milestones.map((milestone, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{milestone.title || `Milestone ${index + 1}`}</div>
                        <div className="text-muted small">{milestone.description || 'No description provided'}</div>
                      </div>
                      <Badge bg="info">
                        {milestone.dueDate ? formatDate(milestone.dueDate) : 'No due date'}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Client View */}
        {userRole === 'client' && (
          <Card className="shadow-sm mb-5">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Manage Your Job Post</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={7}>
                  <h6 className="text-secondary mb-3">Proposals ({job.freelancers?.length || 0})</h6>
                  {job.freelancers && job.freelancers.length > 0 ? (
                    <ListGroup variant="flush">
                      {job.freelancers.map((freelancer) => (
                        <ListGroup.Item key={freelancer._id} className="px-0 py-3 border-bottom">
                          <Row>
                            <Col xs={3} md={2}>
                              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                {freelancer.name?.charAt(0).toUpperCase() || 'F'}
                              </div>
                            </Col>
                            <Col xs={9} md={10}>
                              <h6 className="mb-1">{freelancer.name}</h6>
                              <p className="text-muted mb-2 small">{freelancer.email}</p>
                              <div className="mb-2">
                                <Badge bg="light" text="dark" className="me-2">
                                  Budget: ${freelancer.proposedBudget || job.budget}
                                </Badge>
                                <Badge bg="light" text="dark">
                                  Duration: {freelancer.proposedDuration || 'Not specified'}
                                </Badge>
                              </div>
                              <p className="small mb-2">{freelancer.proposalText || 'No proposal text provided'}</p>
                              <Button variant="outline-primary" size="sm">
                                View Profile
                              </Button>
                              <Button variant="outline-success" size="sm" className="ms-2">
                                Accept Proposal
                              </Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="light" className="text-center py-4">
                      <p className="mb-0">No proposals received yet</p>
                    </Alert>
                  )}
                </Col>
                <Col md={5}>
                  <h6 className="text-secondary mb-3">Job Management</h6>
                  <Card className="bg-light mb-3">
                    <Card.Body>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Job Status</small>
                        <Badge bg={getStatusBadge(job.status)} className="px-3 py-2">
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Applications</small>
                        <span className="fw-bold">{job.freelancers?.length || 0} proposals received</span>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-1">Time Remaining</small>
                        <span className="fw-bold">
                          {new Date(job.acceptedTill) > new Date() ? 
                            `${Math.ceil((new Date(job.acceptedTill) - new Date()) / (1000 * 60 * 60 * 24))} days` : 
                            'Application period ended'}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/client/edit-job/${id}`)}
                    >
                      Edit Job
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleJobAction('delete')}
                    >
                      Delete Job
                    </Button>
                    {job.status === 'open' && (
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleJobAction('close')}
                      >
                        Close Job
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Freelancer View */}
        {userRole === 'freelancer' && (
          <Card className="shadow-sm mb-5">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Submit Your Proposal</h5>
            </Card.Header>
            <Card.Body>
              {job.status === 'open' ? (
                <>
                  {submitStatus && (
                    <Alert variant={submitStatus} dismissible onClose={() => setSubmitStatus(null)}>
                      {submitMessage}
                    </Alert>
                  )}
                  <Form onSubmit={handleProposalSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Cover Letter</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Describe why you're a great fit for this project..."
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        required
                      />
                      <Form.Text className="text-muted">
                        Highlight your relevant experience and approach to this project.
                      </Form.Text>
                    </Form.Group>
                    
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Your Bid ($)</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Enter your bid amount"
                            value={proposedBudget}
                            onChange={(e) => setProposedBudget(e.target.value)}
                            required
                          />
                          <Form.Text className="text-muted">
                            Client's budget: ${job.budget}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Delivery Time</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., 5 days, 2 weeks"
                            value={proposedDuration}
                            onChange={(e) => setProposedDuration(e.target.value)}
                            required
                          />
                          <Form.Text className="text-muted">
                            Deadline: {formatDate(job.completedBy)}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Accordion className="mb-4">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Add Additional Details (Optional)</Accordion.Header>
                        <Accordion.Body>
                          <Form.Group className="mb-3">
                            <Form.Label>Milestone Breakdown</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Describe your project milestones..."
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Attach Portfolio Samples</Form.Label>
                            <Form.Control
                              type="file"
                              multiple
                            />
                            <Form.Text className="text-muted">
                              Max 5 files, 5MB each
                            </Form.Text>
                          </Form.Group>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                      >
                        Submit Proposal
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <Alert variant="warning" className="mb-0">
                  <Alert.Heading>This job is no longer accepting applications</Alert.Heading>
                  <p>This job has been {job.status}. You can browse other available jobs.</p>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <Button variant="primary" onClick={() => navigate('/freelancer/jobs')}>
                      Browse Jobs
                    </Button>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Admin View */}
        {userRole === 'admin' && (
          <Card className="shadow-sm mb-5">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Admin Controls</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Card className="bg-light mb-3 mb-md-0">
                    <Card.Body>
                      <h6>Job Details</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="bg-light ps-0">
                          <strong>Client ID:</strong> {job.client}
                        </ListGroup.Item>
                        <ListGroup.Item className="bg-light ps-0">
                          <strong>Created:</strong> {formatDate(job.createdAt)}
                        </ListGroup.Item>
                        <ListGroup.Item className="bg-light ps-0">
                          <strong>Last Updated:</strong> {formatDate(job.updatedAt)}
                        </ListGroup.Item>
                        <ListGroup.Item className="bg-light ps-0">
                          <strong>Job ID:</strong> {job._id}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <div className="d-grid gap-2">
                    <Button
                      variant="warning"
                      onClick={() => handleJobAction('edit')}
                    >
                      Edit Job
                    </Button>
                    {job.status === 'open' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleJobAction('close')}
                      >
                        Close Job
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => handleJobAction('delete')}
                    >
                      Delete Job
                    </Button>
                  </div>
                </Col>
              </Row>
              
              {/* Admin Activity Log */}
              <hr className="my-4" />
              <h6>Freelancer Applications ({job.freelancers?.length || 0})</h6>
              {job.freelancers && job.freelancers.length > 0 ? (
                <ListGroup variant="flush">
                  {job.freelancers.map((freelancer) => (
                    <ListGroup.Item key={freelancer._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">{freelancer.name}</span>
                        <span className="text-muted ms-3">{freelancer.email}</span>
                      </div>
                      <Button variant="outline-primary" size="sm">View Details</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="light" className="text-center mb-0">
                  <p className="mb-0">No applications received yet</p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </Layout>
  );
};

export default JobDetails;