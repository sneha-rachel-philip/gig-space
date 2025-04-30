import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  getJobsByClient,
  updateJobStatus,
  getProposalsForJob,
  acceptProposal,
  rejectProposal,
  getProposalById,
  createContract,
} from '../../services/apiRoutes';

import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Accordion, 
  Card, 
  Badge, 
  Pagination,
  Table
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 5;

const ClientJobs = () => {
  const [proposals, setProposals] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  const [proposalPage, setProposalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientJobsAndProposals();
  }, []);

  const fetchClientJobsAndProposals = async () => {
    try {
      const jobRes = await getJobsByClient();
      const allJobs = jobRes.data;

      const currentProposals = [];
      const ongoingJobs = [];
      const finishedJobs = [];
      
      for (const job of allJobs) {
        const proposalRes = await getProposalsForJob(job._id);
        const jobProposals = proposalRes.data;
      
        if (job.status === 'open') {
          if (jobProposals.length > 0) {
            jobProposals.forEach((p) => {
              const freelancer = p.freelancer;
      
              currentProposals.push({
                jobId: job._id,
                title: job.title,
                createdAt: job.createdAt,
                freelancerName: freelancer?.name || '—',
                amount: p.proposedBudget,
                status: p.status,
                freelancerId: freelancer?._id || null,
                proposalId: p._id,
              });
            });
          } else {
            currentProposals.push({
              jobId: job._id,
              title: job.title,
              createdAt: job.createdAt,
              freelancerName: '—',
              amount: '—',
              status: 'No proposals yet',
              freelancerId: null,
              proposalId: null,
            });
          }
        } else if (job.status === 'inprogress') {
          ongoingJobs.push({
            title: job.title,
            jobId: job._id,
            startDate: job.createdAt,
            endDate: job.completedBy || 'TBD',
          });
        } else if (job.status === 'closed') {
          finishedJobs.push({
            title: job.title,
            startDate: job.createdAt,
            endDate: job.completedBy || 'TBD',
            amount: job.finalAmount || job.budget || 'N/A',
          });
        }
      }

      setProposals(currentProposals);
      setCurrentJobs(ongoingJobs);
      setCompletedJobs(finishedJobs);
    } catch (err) {
      console.error('Error fetching client jobs/proposals:', err);
    }
  };

  const getProposalDetails = async (proposalId) => {
    try {
      const response = await getProposalById(proposalId);
      return response.data;  // Return the proposal details
    } catch (error) {
      console.error('Error fetching proposal details:', error);
    }
  };

  const handleProposal = async (proposalId, freelancerId, jobId, action) => {
    try {
      await updateJobStatus(jobId, { status: action, freelancerId });
  
      if (action === 'accept') {
        const acceptResponse = await acceptProposal(proposalId);
  
        if (acceptResponse.status === 200) {
          console.log('Proposal accepted successfully');
  
          const proposalDetails = await getProposalDetails(proposalId);
  
          if (!proposalDetails) {
            throw new Error("Proposal details not found");
          }
  
          const { budget, title, deadline } = proposalDetails;
  
          await createContractFromProposal(jobId, freelancerId, proposalId, budget, title, deadline);
        }
      } else if (action === 'reject') {
        await rejectProposal(proposalId);
      }
  
      await fetchClientJobsAndProposals();
    } catch (err) {
      console.error('Error handling proposal:', err);
    }
  };
  

  const { currentUser } = useAuth();

  const createContractFromProposal = async (jobId, freelancerId, proposalId, budget, title, deadline, milestones) => {
    try {
      if (!currentUser) {
        console.error("User not authenticated.");
        return;
      }
  
      const contractData = {
        jobId,
        freelancerId,
        terms: {
          budget,
          title,
          deadline
        },
        milestones,
      };
  
      await createContract(contractData); // uses the correct payload structure
    } catch (err) {
      console.error("Error creating contract from proposal:", err);
    }
  };
  
  
  

  const paginate = (data, page) => data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  
  const renderPagination = (items, currentPage, setPage) => {
    const pages = Math.ceil(items.length / ITEMS_PER_PAGE);
    
    if (pages <= 1) return null;
    
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0} 
        />
        
        {[...Array(pages)].map((_, idx) => (
          <Pagination.Item 
            key={idx} 
            active={idx === currentPage}
            onClick={() => setPage(idx)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        
        <Pagination.Next 
          onClick={() => setPage(p => (p + 1 < pages ? p + 1 : p))}
          disabled={currentPage + 1 >= pages} 
        />
      </Pagination>
    );
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'No proposals yet':
        return <Badge bg="secondary">No proposals</Badge>;
      default:
        return <Badge bg="info">Pending</Badge>;
    }
  };

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1>Jobs Dashboard</h1>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/client/post-job')}
          >
            + Post New Job
          </Button>
        </Col>
      </Row>

      <Accordion defaultActiveKey="0" className="mb-5">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h3 className="mb-0">Current Proposals</h3>
          </Accordion.Header>
          <Accordion.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th>Freelancer</th>
                  <th>Bid Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(proposals, proposalPage).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link to={`/jobs/${item.jobId}`}>{item.title}</Link>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.freelancerName}</td>
                    <td>{item.amount !== '—' ? `$${item.amount}` : '—'}</td>
                    <td>
                      {item.status !== 'accepted' && item.status !== 'rejected' && item.proposalId && (
                        <div className="d-flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleProposal(item.proposalId, item.freelancerId, item.jobId, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleProposal(item.proposalId, item.freelancerId, item.jobId, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-3">No proposals available</td>
                  </tr>
                )}
              </tbody>
            </Table>
            {renderPagination(proposals, proposalPage, setProposalPage)}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <h3 className="mb-0">Current Jobs</h3>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {paginate(currentJobs, currentPage).map((job, idx) => (
                <Col key={idx} md={6} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        <Link to={`/job-area/${job.jobId}`}>{job.title}</Link>
                      </Card.Title>
                      <Card.Text>
                        <strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}<br />
                        <strong>Expected Completion:</strong> {job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}
                      </Card.Text>
                      <Badge bg="primary">In Progress</Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {currentJobs.length === 0 && (
                <Col className="text-center py-3">No current jobs available</Col>
              )}
            </Row>
            {renderPagination(currentJobs, currentPage, setCurrentPage)}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <h3 className="mb-0">Completed Jobs</h3>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {paginate(completedJobs, completedPage).map((job, idx) => (
                <Col key={idx} md={6} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{job.title}</Card.Title>
                      <Card.Text>
                        <strong>Started:</strong> {new Date(job.startDate).toLocaleDateString()}<br />
                        <strong>Completed:</strong> {job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}<br />
                        <strong>Amount:</strong> ${job.amount}
                      </Card.Text>
                      <Badge bg="success">Completed</Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {completedJobs.length === 0 && (
                <Col className="text-center py-3">No completed jobs available</Col>
              )}
            </Row>
            {renderPagination(completedJobs, completedPage, setCompletedPage)}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default ClientJobs;