import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getJobsByClient, getProposalsForJob } from '../../services/apiRoutes';

import { Container, Row, Col, Button, Accordion, Card, Badge, Pagination, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 5;

const ClientJobs = () => {
  const [openProjects, setOpenProjects] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  const [openProjectPage, setOpenProjectPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientJobs();
  }, []);

  const fetchClientJobs = async () => {
    try {
      const jobRes = await getJobsByClient();
      const allJobs = jobRes.data;

      const openJobs = [];
      const ongoingJobs = [];
      const finishedJobs = [];

      for (const job of allJobs) {
        const proposalRes = await getProposalsForJob(job._id);
        const jobProposals = proposalRes.data;

        if (job.status === 'open') {
          openJobs.push({
            jobId: job._id,
            title: job.title,
            createdAt: job.createdAt,
            acceptedTill: job.acceptedTill,
            proposalCount: jobProposals.length, // Number of proposals
          });
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

      setOpenProjects(openJobs);
      setCurrentJobs(ongoingJobs);
      setCompletedJobs(finishedJobs);
    } catch (err) {
      console.error('Error fetching client jobs:', err);
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
        {/* Open Projects Section */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h3 className="mb-0">Open Projects</h3>
          </Accordion.Header>
          <Accordion.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Posted</th>
                  <th>Expiring On</th>
                  <th>Proposals</th>
                </tr>
              </thead>
              <tbody>
                {paginate(openProjects, openProjectPage).map((job, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link to={`/jobs/${job.jobId}`}>{job.title}</Link>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(job.acceptedTill).toLocaleDateString()}</td>
                    <td>{job.proposalCount}</td>
                  </tr>
                ))}
                {openProjects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-3">No open projects</td>
                  </tr>
                )}
              </tbody>
            </Table>
            {renderPagination(openProjects, openProjectPage, setOpenProjectPage)}
          </Accordion.Body>
        </Accordion.Item>

        {/* Current Jobs Section */}
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

        {/* Completed Jobs Section */}
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
