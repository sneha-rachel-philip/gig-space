import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getJobById,
  getCurrentUser,
  applyForJob,
  deleteJob,
  closeJob,
  submitProposal,
  getProposalsForJob,
  createContract,
  getContractByJobId,
  acceptProposal,
} from '../../services/apiRoutes';
import { 
  Container, Card, Button, Form, Row, Col, Spinner, 
  Badge, Nav, Tab, Alert, Table, ProgressBar 
} from "react-bootstrap";
import { FaUser, FaClock, FaCalendarAlt, FaMoneyBillWave, FaTags, FaTools } from 'react-icons/fa';
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
  const [contractStatus, setContractStatus] = useState('none');
  const [activeTab, setActiveTab] = useState('details');
  const [clientData, setClientData] = useState(null);

  // Fetch job and user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await getJobById(id);
        setJob(jobRes.data);
        setJobStatus(jobRes.data.status);
        setClientData(jobRes.data.client); // Assuming client data is included in the job response

        try {
          const contractRes = await getContractByJobId(id);
          const contract = contractRes.data;
          if (contract?.status === 'none') {
            setContractStatus('pending');
          } else if (contract?.status === 'pending') {
            setContractStatus('created');
          } else {
            setContractStatus('none');
          }
        } catch {
          console.warn('No contract found for this job yet');
          setContractStatus('none');
        }
      } catch (error) {
        console.error('Error fetching job or contract:', error);
      }

      try {
        const userRes = await getCurrentUser();
        setUserRole(userRes.data.role);
      } catch {
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
        } catch {
          console.warn("No contract found, setting status to 'none'");
          setContractStatus('none');
        }
  
        setProposalAccepted(true);
        setActiveTab('contract');
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
    try {
      const contractData = {
        job,
        freelancer: selectedProposal.freelancer,
        client: job.client,
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

      const response = await createContract(contractData);

      if (response.status === 201) {
        alert('Contract created successfully!');
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
        const confirm = window.confirm("Are you sure you want to delete this job? This action cannot be undone.");
        if (confirm) {
          await deleteJob(id);
          alert('Job deleted successfully!');
          navigate(userRole === 'admin' ? '/admin/jobs' : '/client/dashboard');
        }
      } else if (action === 'close') {
        const confirm = window.confirm("Are you sure you want to close this job?");
        if (confirm) {
          await closeJob(id);
          alert('Job closed successfully!');
          setJobStatus('closed');
        }
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

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="success">Open</Badge>;
      case 'closed':
        return <Badge bg="danger">Closed</Badge>;
      case 'in-progress':
        return <Badge bg="warning">In Progress</Badge>;
      case 'completed':
        return <Badge bg="info">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Loading state
  if (!job || loadingUser) {
    return (
      <LayoutUser>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading job details...</p>
        </Container>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <Container className="py-4">
        {/* Top Section with Job Title, Status, and Client Info */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">{job.title}</h2>
                <div className="mb-2">
                  {getStatusBadge(job.status)}
                  <span className="text-muted ms-3">Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                {clientData && (
                  <div className="mb-0">
                  <FaUser className="me-2 text-secondary" />
                  <span>Client: </span>
                  <Link to={`/user/${clientData.id}/profile`} className="text-decoration-none">
                    {clientData.name || "Client Name"}
                  </Link>
                </div>
                )}
              </div>
              <div className="d-flex gap-2 mt-3 mt-md-0">
                {userRole === 'client' && (
                  <>
                    <Button variant="outline-primary" onClick={() => handleJobAction('edit')}>
                      Edit Job
                    </Button>
                    <Button variant="outline-danger" onClick={() => handleJobAction('delete')}>
                      Delete Job
                    </Button>
                  </>
                )}
                {userRole === 'admin' && (
                  <Button variant="outline-danger" onClick={() => handleJobAction('close')}>
                    Close Job
                  </Button>
                )}
                {contractStatus === 'created' && userRole === 'client' && (
                  <Button variant="primary" onClick={() => navigate(`/job-area/${job._id}`)}>
                    Go to Workspace
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Main Content with Tabs */}
        <Tab.Container id="job-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Nav variant="tabs" className="border-bottom-0">
                <Nav.Item>
                  <Nav.Link eventKey="details" className="px-4">Job Details</Nav.Link>
                </Nav.Item>
                {userRole === 'client' && (
                  <Nav.Item>
                    <Nav.Link eventKey="proposals" className="px-4">
                      Proposals {proposals.length > 0 && <Badge bg="primary" pill>{proposals.length}</Badge>}
                    </Nav.Link>
                  </Nav.Item>
                )}
                {userRole === 'freelancer' && (
                  <Nav.Item>
                    <Nav.Link eventKey="submitProposal" className="px-4">Submit Proposal</Nav.Link>
                  </Nav.Item>
                )}
                {proposalAccepted && showContractForm && (
                  <Nav.Item>
                    <Nav.Link eventKey="contract" className="px-4">Contract</Nav.Link>
                  </Nav.Item>
                )}
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Content>
                {/* Job Details Tab */}
                <Tab.Pane eventKey="details">
                  <Row>
                    <Col lg={8}>
                      <h5 className="mb-3">Description</h5>
                      <p className="text-secondary">{job.description}</p>
                      
                      {job.milestones && job.milestones.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-3">Project Milestones</h5>
                          <ul className="list-group mb-4">
                            {job.milestones.map((milestone, index) => (
                              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>{milestone}</div>
                                <Badge bg="secondary" pill>{index + 1}</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Col>
                    <Col lg={4}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h5 className="mb-3">Job Details</h5>
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaMoneyBillWave className="text-success me-2" />
                              <div className="text-muted">Budget</div>
                            </div>
                            <div className="fw-bold">₹{job.budget}</div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaCalendarAlt className="text-primary me-2" />
                              <div className="text-muted">Timeline</div>
                            </div>
                            <div>
                              <div className="mb-1">
                                <small className="text-muted">Accepting Till:</small>
                                <div>{new Date(job.acceptedTill).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <small className="text-muted">To Be Completed By:</small>
                                <div>{new Date(job.completedBy).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <FaTags className="text-info me-2" />
                              <div className="text-muted">Category</div>
                            </div>
                            <div className="fw-bold">{job.category}</div>
                          </div>
                          
                          <div>
                            <div className="d-flex align-items-center mb-2">
                              <FaTools className="text-warning me-2" />
                              <div className="text-muted">Skills Required</div>
                            </div>
                            <div>
                              {job.skillsRequired.map((skill, index) => (
                                <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Proposals Tab (For Clients) */}
                <Tab.Pane eventKey="proposals">
                  {proposals.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Freelancer</th>
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
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded-circle p-2 me-3">
                                    <FaUser className="text-secondary" />
                                  </div>
                                  <div>
                                    <div className="fw-bold">
                                      <Link to={`/user/${proposal.freelancer._id}/profile`} className="text-decoration-none">
                                        {proposal.freelancer.name}
                                      </Link>
                                    </div>
                                    <div className="small text-muted">{proposal.freelancer.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ maxWidth: '300px' }}>{proposal.proposalText}</td>
                              <td className="fw-bold">₹{proposal.proposedBudget}</td>
                              <td>{proposal.proposedDuration}</td>
                              <td>
                                {proposal.status === 'pending' ? (
                                  <Badge bg="warning">Pending</Badge>
                                ) : proposal.status === 'accepted' ? (
                                  <Badge bg="success">Accepted</Badge>
                                ) : (
                                  <Badge bg="secondary">Rejected</Badge>
                                )}
                              </td>
                              <td>
                                {proposal.status === 'pending' ? (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => handleAcceptProposal(proposal._id)}
                                  >
                                    Accept
                                  </Button>
                                ) : proposal.status === 'accepted' ? (
                                  <span className="text-success fw-bold">✓ Accepted</span>
                                ) : (
                                  <span className="text-muted">Rejected</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info">
                      <div className="text-center py-4">
                        <div className="mb-3">No proposals have been submitted yet.</div>
                        <p className="text-muted">Check back later or consider updating your job post to attract more freelancers.</p>
                      </div>
                    </Alert>
                  )}
                </Tab.Pane>

                {/* Submit Proposal Tab (For Freelancers) */}
                <Tab.Pane eventKey="submitProposal">
                  <Row>
                    <Col lg={8} className="mx-auto">
                      <Card className="border-0">
                        <Card.Body>
                          <h5 className="mb-4">Submit Your Proposal</h5>
                          {submitMessage && (
                            <Alert variant="success" className="mb-4">
                              {submitMessage}
                            </Alert>
                          )}
                          <Form onSubmit={handleProposalSubmit}>
                            <Form.Group className="mb-4">
                              <Form.Label>Tell us why you're perfect for this job</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Introduce yourself and explain how your skills and experience make you a great fit for this job..."
                                value={proposalText}
                                onChange={(e) => setProposalText(e.target.value)}
                                required
                              />
                              <Form.Text className="text-muted">
                                Be specific about your skills and experience relevant to this job.
                              </Form.Text>
                            </Form.Group>
                            <Row className="mb-4">
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Your Proposed Budget (₹)</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={proposedBudget}
                                    onChange={(e) => setProposedBudget(e.target.value)}
                                    required
                                  />
                                  <Form.Text className="text-muted">
                                    Client's budget: ₹{job.budget}
                                  </Form.Text>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Estimated Duration</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="e.g., 5 days, 2 weeks"
                                    value={proposedDuration}
                                    onChange={(e) => setProposedDuration(e.target.value)}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <div className="d-grid">
                              <Button variant="primary" type="submit" size="lg">
                                Submit Proposal
                              </Button>
                            </div>
                          </Form>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Contract Tab */}
                <Tab.Pane eventKey="contract">
                  {contractStatus === 'none' && showContractForm && (
                    <Card className="border-0">
                      <Card.Body>
                        <h5 className="mb-4">Create Contract</h5>
                        {selectedProposal && (
                          <Alert variant="info" className="mb-4">
                            <div className="d-flex">
                              <div className="me-3">
                                <FaUser className="fs-4 text-primary" />
                              </div>
                              <div>
                                <strong>Proposal from {selectedProposal.freelancer.name} has been accepted.</strong>
                                <p className="mb-0 mt-1">Please fill out the contract details below to proceed.</p>
                              </div>
                            </div>
                          </Alert>
                        )}
                        <Form onSubmit={handleContractSubmit}>
                          <Row className="mb-4">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Contract Budget (₹)</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={contractBudget}
                                  onChange={(e) => setContractBudget(e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={contractStartDate}
                                  onChange={(e) => setContractStartDate(e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <h6 className="mb-3">Milestone Payments</h6>
                          {job.milestones.map((label, index) => (
                            <Card key={index} className="mb-3 border">
                              <Card.Body>
                                <h6>{label}</h6>
                                <Row>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Amount (₹)</Form.Label>
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
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Due Date</Form.Label>
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
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          ))}

                          <Form.Group className="mb-4">
                            <Form.Label>Project End Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={contractEndDate}
                              onChange={(e) => setContractEndDate(e.target.value)}
                              required
                            />
                          </Form.Group>

                          <div className="d-grid">
                            <Button type="submit" variant="success" size="lg">
                              Create Contract
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  )}

                  {contractStatus === 'created' && (
                    <div className="text-center py-4">
                      <div className="mb-4">
                        <span className="bg-success text-white p-3 rounded-circle d-inline-block mb-3">
                          <i className="fas fa-check fs-3"></i>
                        </span>
                        <h4>Contract Created Successfully!</h4>
                        <p className="text-muted">You can now proceed to the project workspace.</p>
                      </div>
                      <Button variant="primary" size="lg" onClick={() => navigate(`/job-area/${job._id}`)}>
                        Go to Workspace
                      </Button>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>
    </LayoutUser>
  );
};

export default JobDetails;