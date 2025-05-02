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
  rejectProposal,
  getProposalById,
  updateJobStatus,
  createContract,
  getContractByJobId,
  acceptProposal,
} from '../../services/apiRoutes';
import { Container, Card, Button, Form, Row, Col, Spinner } from "react-bootstrap";
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
  const [showContractForm, setShowContractForm] = useState(false);
  const [milestoneAmounts, setMilestoneAmounts] = useState([]);
  const [milestoneDates, setMilestoneDates] = useState([]);
  const [contractBudget, setContractBudget] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
 /*  const [contractCreated, setContractCreated] = useState(false); 
  const [goToWorkspace, setGoToWorkspace] = useState(false);  */
  const [contractStatus, setContractStatus] = useState('none');
  // Fetch job and user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await getJobById(id);
        setJob(jobRes.data);
        setJobStatus(jobRes.data.status);

        try {
          const contractRes = await getContractByJobId(id);
          const contract = contractRes.data;
          console.log('Contract:', contract); 
          if (contract?.status === 'none') {
            setContractStatus('pending');
          } else if (contract?.status === 'pending') {
            setContractStatus('created');
          } else {
            setContractStatus('none'); // Default or no contract found
          }
        } catch  {
          console.warn('No contract found for this job yet');
          setContractStatus('none');
        }
      } catch (error) {
        console.error('Error fetching job or contract:', error);
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
    };

    fetchData();
  }, [id]);

  const handleAcceptProposal = async (proposalId) => {
    const confirm = window.confirm("Are you sure you want to accept this proposal?");
    if (!confirm) return;
  
    try {
      const res = await acceptProposal(proposalId);
  
      if (res.status === 200) {
        const { proposal, job } = res.data;
        setSelectedProposal(proposal);
        setJob(job);
        setShowContractForm(true);
  
        const refreshed = await getProposalsForJob(job._id);
        setProposals(refreshed.data);
  
        try {
          const contractRes = await getContractByJobId(job._id);
          if (contractRes.data?.status) {
            setContractStatus(contractRes.data.status);
          } else {
            setContractStatus('none');
          }
        } catch  {
          // Expected if no contract exists yet (404)
          console.warn("No contract found, setting status to 'none'");
          setContractStatus('none');
        }
  
        setProposalAccepted(true);
      } else {
        throw new Error("Failed to accept proposal");
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      alert("An error occurred while accepting the proposal.");
    }
  };
  
  

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    //console.log('Selected proposal:', selectedProposal);
    console.log(job.client)
    try {
      const contractData = {
        job,
        freelancer: selectedProposal.freelancer,
        client: job.client, // confirm this is present
        milestonePayments: job.milestones.map((label, i) => ({
          label,
          amount: milestoneAmounts[i],
          completedAt: milestoneDates[i],
        })),
        startDate: contractStartDate,
        endDate: contractEndDate,
        budget: contractBudget,
        title: job.title,
      };

      const response = await createContract(contractData); // <-- your helper function

      if (response.status === 201) {
        alert('Contract created successfully!');
        // TODO: Show "View Contract" button
        setShowContractForm(false);
        setContractStatus('created');
      }
    } catch (err) {
      console.error('Error creating contract:', err);
      alert('Failed to create contract.');
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
          <Button variant="warning" onClick={() => handleJobAction('edit')}>Edit Job</Button>
          <Button variant="danger" onClick={() => handleJobAction('delete')}>Delete Job</Button>
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
                            {proposal.status === 'pending' ? (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleAcceptProposal(proposal._id)}
                              >
                                Accept
                              </Button>
                            ) : proposal.status === 'accepted' ? (
                              <span className="text-success fw-bold">Accepted</span>
                            ) : (
                              <span className="text-muted">Rejected</span>
                            )}
                          </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted my-3">No proposals yet.</p>
            )}

            {/* Debug block */}
<pre>
  ProposalAccepted: {String(proposalAccepted)}{'\n'}
  ContractStatus: {contractStatus}{'\n'}
  ShowForm: {String(showContractForm)}
</pre>

          {proposalAccepted && contractStatus === 'none' && (
            <div className="mt-4 alert alert-success">
              <strong>Proposal accepted.</strong> You may proceed to create the contract terms below.
            </div>
          )}


            {contractStatus === 'none' && showContractForm && (
              <Card className="p-4 my-4">
                <h5>Finalize Contract Terms</h5>
                <Form onSubmit={handleContractSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Budget</Form.Label>
                    <Form.Control
                      type="number"
                      value={contractBudget}
                      onChange={(e) => setContractBudget(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {job.milestones.map((label, index) => (
                    <Row key={index} className="mb-3">
                      <Col md={6}>
                        <Form.Label>{label} - Amount</Form.Label>
                        <Form.Control
                          type="number"
                          value={milestoneAmounts[index] || ''}
                          onChange={(e) => {
                            const newAmounts = [...milestoneAmounts];
                            newAmounts[index] = e.target.value;
                            setMilestoneAmounts(newAmounts);
                          }}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>{label} - Completion Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={milestoneDates[index] || ''}
                          onChange={(e) => {
                            const newDates = [...milestoneDates];
                            newDates[index] = e.target.value;
                            setMilestoneDates(newDates);
                          }}
                          required
                        />
                      </Col>
                    </Row>
                  ))}

                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={contractEndDate}
                      onChange={(e) => setContractEndDate(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="success">Create Contract</Button>
                </Form>
              </Card>
            )}

              {/* Display "Go to workspace" button after contract is created */}
              {contractStatus === 'created' && (
              <div className="mt-4">
                <Button variant="primary" onClick={() => navigate(`/job-area/${job._id}`)}>Go to Workspace</Button>
              </div>
            )}
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
