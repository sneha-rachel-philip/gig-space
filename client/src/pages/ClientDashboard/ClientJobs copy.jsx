import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Button, Accordion, Badge, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getJobsByClient, getProposalsForJob } from '../../services/apiRoutes';

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

  const paginate = (data, page) => data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const renderPagination = (items, currentPage, setPage) => {
    const pages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (pages <= 1) return null;
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} />
        {[...Array(pages)].map((_, idx) => (
          <Pagination.Item key={idx} active={idx === currentPage} onClick={() => setPage(idx)}>
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setPage(p => (p + 1 < pages ? p + 1 : p))} disabled={currentPage + 1 >= pages} />
      </Pagination>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <Badge bg="success">Accepted</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      case 'No proposals yet': return <Badge bg="secondary">No proposals</Badge>;
      default: return <Badge bg="info">Pending</Badge>;
    }
  };

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h1>Jobs Dashboard</h1>
          <Button variant="primary" size="lg" onClick={() => navigate('/client/post-job')}>
            + Post New Job
          </Button>
        </Col>
      </Row>

      <Accordion defaultActiveKey="0" className="mb-5">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Open Jobs</Accordion.Header>
          <Accordion.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  <th>Freelancer</th>
                  <th>Bid Amount</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {paginate(proposals, proposalPage).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.title}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.freelancerName}</td>
                    <td>{item.amount !== '—' ? `₹${item.amount}` : '—'}</td>
                    <td><Button size="sm" onClick={() => navigate(`/jobs/${item.jobId}`)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination(proposals, proposalPage, setProposalPage)}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Ongoing Jobs</Accordion.Header>
          <Accordion.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Start Date</th>
                  <th>Expected Completion</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {paginate(currentJobs, currentPage).map((job, idx) => (
                  <tr key={idx}>
                    <td>{job.title}</td>
                    <td>{new Date(job.startDate).toLocaleDateString()}</td>
                    <td>{job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}</td>
                    <td><Button size="sm" onClick={() => navigate(`/job-area/${job.jobId}`)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination(currentJobs, currentPage, setCurrentPage)}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>Completed Jobs</Accordion.Header>
          <Accordion.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginate(completedJobs, completedPage).map((job, idx) => (
                  <tr key={idx}>
                    <td>{job.title}</td>
                    <td>{new Date(job.startDate).toLocaleDateString()}</td>
                    <td>{job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}</td>
                    <td>{`₹${job.amount}`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination(completedJobs, completedPage, setCompletedPage)}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default ClientJobs;
