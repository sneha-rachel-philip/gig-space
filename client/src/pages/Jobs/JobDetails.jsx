import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJobById,
  getCurrentUser,
  applyForJob,
  deleteJob,
  closeJob,
  submitProposal,
  getProposalsForJob,
  acceptProposal,
  rejectProposal,
  getProposalById,
  updateJobStatus,
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
  const [proposals, setProposals] = useState([]);
  const [jobStatus, setJobStatus] = useState('');
  const [proposalAccepted, setProposalAccepted] = useState(false);


  // Fetch job and user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await getJobById(id);
        setJob(jobRes.data);
        setJobStatus(jobRes.data.status);
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

      try {
        const proposalsRes = await getProposalsForJob(id);
        setProposals(proposalsRes.data);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
      try {
        const proposalsRes = await getProposalsForJob(id);
        setProposals(proposalsRes.data);
        const accepted = proposalsRes.data.some(p => p.status === 'accepted');
        setProposalAccepted(accepted);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
  
      
    };

    fetchData();
  }, [id]);

  const handleAcceptProposal = async (proposalId, freelancerId) => {
    const confirm = window.confirm("Are you sure you want to accept this proposal? This will mark the job as 'in progress' and reject all other proposals.");
    if (!confirm) return;
    console.log('Accepting proposal:', proposalId, 'for freelancer:', freelancerId);
    console.log('Job ID:', id);
    try {
      // 1. Update job status to "inprogress" and assign freelancer
      await updateJobStatus(id, { status: 'inprogress', freelancerId });
  
      // 2. Accept this proposal
      const acceptResponse = await acceptProposal(proposalId);
  
      if (acceptResponse.status === 200) {
        console.log('Proposal accepted successfully');
  
        // 3. Get proposal details (for contract creation)
        const proposalDetails = await getProposalById(proposalId);
  
        if (!proposalDetails) {
          throw new Error("Proposal details not found");
        }
  
        //const { budget, title, deadline } = proposalDetails;
  
        // 4. Create contract from accepted proposal
       //await createContractFromProposal(id, freelancerId, proposalId, budget, title, deadline);
  
        // 5. Reject all other proposals
        await Promise.all(
          proposals
            .filter((p) => p._id !== proposalId && p.status === 'pending')
            .map((p) => rejectProposal(p._id))
        );
  
        // 6. Update local UI state
        const updatedProposals = proposals.map((p) =>
          p._id === proposalId
            ? { ...p, status: 'accepted' }
            : { ...p, status: 'rejected' }
        );
  
        setProposals(updatedProposals);
        setJob((prev) => ({ ...prev, status: 'inprogress' }));
        setProposalAccepted(true); // To disable other buttons and show contract area
      } else {
        throw new Error("Failed to accept proposal");
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      alert("An error occurred while accepting the proposal.");
    }
  };
  

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
  console.log('Loaded proposals:', proposals);
  console.log('User Role:', userRole);

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
        </Card>

        {/* Client Actions */}
        {userRole === 'client' && (
            <Card className="shadow-sm mb-5">
            <Card.Body>
              <Card.Title>Proposals</Card.Title>
              {proposals.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Freelancer</th>
                        <th>Email</th>
                        <th>Proposal</th>
                        <th>Budget</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.map((proposal) => (
                        <tr key={proposal._id}>
                          <td>{proposal.freelancer.name}</td>
                          <td>{proposal.freelancer.email}</td>
                          <td>{proposal.proposalText}</td>
                          <td>₹{proposal.proposedBudget}</td>
                          <td>{proposal.proposedDuration}</td>
                          <td>{proposal.status}</td>
                          <td>
                            {/* Disable "Accept" button if already accepted */}
                            <Button
                              size="sm"
                              variant="success"
                              disabled={proposalAccepted || proposal.status === 'accepted'}
                              onClick={() => handleAcceptProposal(proposal._id, proposal.freelancer._id)}
                            >
                              Accept
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted my-3">No proposals yet.</p>
              )}

              {proposalAccepted && (
                <div className="mt-4 alert alert-success">
                  <strong>Proposal accepted.</strong> You may proceed to create the contract terms below.
                </div>
              )}

              {proposalAccepted && (
                <Card className="mt-4">
                  <Card.Body>
                    <Card.Title>Contract Creation</Card.Title>
                    <p>(This area is reserved for entering contract terms)</p>
                  </Card.Body>
                </Card>
              )}

              <div className="d-flex gap-3 mt-4">
                <Button variant="warning" onClick={() => handleJobAction('edit')}>
                  Edit Contract
                </Button>
                <Button variant="danger" onClick={() => handleJobAction('delete')}>
                  Delete Contract
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
