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
import { Container, Card, Button, Form, Row, Col, ListGroup, Spinner } from "react-bootstrap";
import LayoutUser from '../../components/Layout';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [proposalText, setProposalText] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch job and user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await getJobById(id);
        setJob(jobRes.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }

      try {
        const userRes = await getCurrentUser();
        setUserRole(userRes.data.role);
      } catch  {
        console.warn('No logged in user, treating as guest');
        setUserRole('guest');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJobAction = async (action) => {
    try {
      if (action === 'apply') {
        await applyForJob(id);
        alert('Successfully applied for the job!');
      } else if (action === 'delete') {
        await deleteJob(id);
        alert('Job deleted successfully!');
        navigate(userRole === 'admin' ? '/admin/jobs' : '/client/dashboard');
      } else if (action === 'close') {
        await closeJob(id);
        alert('Job closed successfully!');
      } else if (action === 'edit') {
        navigate(`/client/edit-job/${id}`);
      }
    } catch (error) {
      console.error(`Error performing action (${action}):`, error);
      alert(`Something went wrong while trying to ${action} the job.`);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitProposal({
        jobId: id,
        proposalText,
        proposedBudget,
        proposedDuration,
      });
      setSubmitMessage('Proposal submitted successfully!');
      setProposalText('');
      setProposedBudget('');
      setProposedDuration('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit proposal.';
      setSubmitMessage(errorMessage);
    }
  };

  if (!job || loadingUser) {
    return (
      <LayoutUser>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </Container>
      </LayoutUser>
    );
  }

  return (
      <Container className="py-5">
        {/* Job Details */}
        <Card className="shadow-sm mb-5">
          <Card.Body>
            <Card.Title className="mb-3">{job.title}</Card.Title>
            <Card.Text>{job.description}</Card.Text>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Budget:</strong> ₹{job.budget}
              </Col>
              <Col md={6}>
                <strong>Category:</strong> {job.category}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Accepted Till:</strong> {new Date(job.acceptedTill).toLocaleDateString()}
              </Col>
              <Col md={6}>
                <strong>To Be Completed By:</strong> {new Date(job.completedBy).toLocaleDateString()}
              </Col>
            </Row>

            <Card.Text>
              <strong>Skills Required:</strong> {job.skillsRequired.join(', ')}
            </Card.Text>

            <Card.Text>
              <strong>Status:</strong> {job.status}
            </Card.Text>
          </Card.Body>
        </Card>

        {/* Client Actions */}
        {userRole === 'client' && (
          <Card className="shadow-sm mb-5">
            <Card.Body>
              <Card.Title>Proposals</Card.Title>
              {job.freelancers.length > 0 ? (
                <ListGroup variant="flush" className="my-3">
                  {job.freelancers.map((freelancer) => (
                    <ListGroup.Item key={freelancer._id}>
                      <div>
                        <p className="mb-1 fw-semibold">{freelancer.name}</p>
                        <small className="text-muted">{freelancer.email}</small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted my-3">No proposals yet.</p>
              )}
              <div className="d-flex gap-3 mt-3">
                <Button
                  variant="warning"
                  onClick={() => handleJobAction('edit')}
                >
                  Edit Job
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleJobAction('delete')}
                >
                  Delete Job
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Freelancer Actions */}
        {userRole === 'freelancer' && (
          <Card className="shadow-sm mb-5">
            <Card.Body>
              <Card.Title>Place Your Bid</Card.Title>
              <Form onSubmit={handleProposalSubmit} className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label>Proposal Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Write your proposal..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    required
                  />
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Proposed Budget ($)</Form.Label>
                      <Form.Control
                        type="number"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Proposed Duration (e.g., 5 days)</Form.Label>
                      <Form.Control
                        type="text"
                        value={proposedDuration}
                        onChange={(e) => setProposedDuration(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" className="mt-4">
                  Submit Proposal
                </Button>
                {submitMessage && (
                  <div className="mt-3 text-success fw-semibold">
                    {submitMessage}
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        )}

        {/* Admin Actions */}
        {userRole === 'admin' && (
          <div className="text-center">
            <Button
              variant="success"
              onClick={() => handleJobAction('close')}
            >
              Close Job
            </Button>
          </div>
        )}
      </Container>
  );
};

export default JobDetails;
