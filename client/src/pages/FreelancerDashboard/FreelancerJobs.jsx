// FreelancerJobsDashboard.js

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobsByFreelancer, getProposalsForFreelancer } from '../../services/apiRoutes';

import {
  Container,
  Row,
  Col,
  Table,
  Accordion,
  Card,
  Badge,
  Pagination,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 5;

const FreelancerJobsDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [proposalPage, setProposalPage] = useState(0);
  const [currentJobPage, setCurrentJobPage] = useState(0);

  useEffect(() => {
    fetchFreelancerData();
  }, []);

  const fetchFreelancerData = async () => {
    try {
      const jobsRes = await getJobsByFreelancer();
      const proposalsRes = await getProposalsForFreelancer();

      const jobsData = jobsRes.data;
      const proposalsData = proposalsRes.data;

      const activeJobs = jobsData.map((job) => ({
        title: job.title,
        clientName: job.client?.name || 'Unknown',
        createdAt: job.createdAt,
        budget: job.budget || 'N/A',
        jobId: job._id,
      }));

      const currentProposals = proposalsData.map((proposal) => ({
        title: proposal.job?.title || 'Unknown',
        clientName: proposal.job?.client?.name || 'Unknown',
        createdAt: proposal.createdAt,
        status: proposal.status || 'pending',
        jobId: proposal.job?._id || '',
      }));

      setCurrentJobs(activeJobs);
      setProposals(currentProposals);
    } catch (error) {
      console.error('Error fetching freelancer dashboard data:', error);
    }
  };

  const paginate = (data, page) => data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const renderPagination = (items, currentPage, setPage) => {
    const pages = Math.ceil(items.length / ITEMS_PER_PAGE);

    if (pages <= 1) return null;

    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev
          onClick={() => setPage((p) => Math.max(0, p - 1))}
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
          onClick={() => setPage((p) => (p + 1 < pages ? p + 1 : p))}
          disabled={currentPage + 1 >= pages}
        />
      </Pagination>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="info">Pending</Badge>;
    }
  };

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h1>Freelancer Dashboard</h1>
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
                  <th>Client</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginate(proposals, proposalPage).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link to={`/jobs/${item.jobId}`}>{item.title}</Link>
                    </td>
                    <td>{item.clientName}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-3">
                      No proposals found
                    </td>
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
              {paginate(currentJobs, currentJobPage).map((job, idx) => (
                <Col key={idx} md={6} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        <Link to={`/job-area/${job.jobId}`}>{job.title}</Link>
                      </Card.Title>
                      <Card.Text>
                        <strong>Client:</strong> {job.clientName} <br />
                        <strong>Start Date:</strong> {new Date(job.createdAt).toLocaleDateString()} <br />
                        <strong>Budget:</strong> ${job.budget}
                      </Card.Text>
                      <Badge bg="primary">Ongoing</Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {currentJobs.length === 0 && (
                <Col className="text-center py-3">No ongoing jobs</Col>
              )}
            </Row>
            {renderPagination(currentJobs, currentJobPage, setCurrentJobPage)}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default FreelancerJobsDashboard;
