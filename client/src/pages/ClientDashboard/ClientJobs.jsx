import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getJobsByClient, getProposalsForJob } from '../../services/apiRoutes';
import { 
  Row, 
  Col, 
  Button, 
  Accordion, 
  Card, 
  Badge, 
  Pagination, 
  Table,
  Spinner
} from 'react-bootstrap';

const ITEMS_PER_PAGE = 5;

const ClientJobs = () => {
  const [openProjects, setOpenProjects] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openProjectPage, setOpenProjectPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientJobs();
  }, []);

  const fetchClientJobs = async () => {
    setLoading(true);
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
            proposalCount: jobProposals.length,
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
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Jobs Dashboard</h2>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/client/post-job')}
          >
            + Post New Job
          </Button>
        </Col>
      </Row>

      <Accordion defaultActiveKey="0" className="mb-4">
        {/* Open Projects Section */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h5 className="mb-0 fw-bold">Open Projects</h5>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Date Posted</th>
                    <th>Expiring On</th>
                    <th>Proposals</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(openProjects, openProjectPage).map((job, idx) => (
                    <tr key={idx}>
                      <td>
                        <Link to={`/jobs/${job.jobId}`} className="text-decoration-none fw-medium">{job.title}</Link>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(job.acceptedTill).toLocaleDateString()}</td>
                      <td>
                        <Badge bg="info" pill>{job.proposalCount}</Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => navigate(`/jobs/${job.jobId}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {openProjects.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No open projects. Ready to start a new project?{' '}
                        <Button variant="link" onClick={() => navigate('/client/post-job')} className="p-0">
                          Post a job now
                        </Button>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            {renderPagination(openProjects, openProjectPage, setOpenProjectPage)}
          </Accordion.Body>
        </Accordion.Item>

        {/* Current Jobs Section */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <h5 className="mb-0 fw-bold">Current Jobs</h5>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {paginate(currentJobs, currentPage).map((job, idx) => (
                <Col key={idx} lg={6} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>
                        <Link to={`/job-area/${job.jobId}`} className="text-decoration-none">{job.title}</Link>
                      </Card.Title>
                      <Card.Text>
                        <strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}<br />
                        <strong>Expected Completion:</strong> {job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <Badge bg="primary" pill>In Progress</Badge>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/job-area/${job.jobId}`)}
                        >
                          Go to Workspace
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {currentJobs.length === 0 && (
                <Col className="text-center py-4">
                  <p className="text-muted mb-0">No jobs in progress. Active jobs will appear here.</p>
                </Col>
              )}
            </Row>
            {renderPagination(currentJobs, currentPage, setCurrentPage)}
          </Accordion.Body>
        </Accordion.Item>

        {/* Completed Jobs Section */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <h5 className="mb-0 fw-bold">Completed Jobs</h5>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              {paginate(completedJobs, completedPage).map((job, idx) => (
                <Col key={idx} lg={6} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{job.title}</Card.Title>
                      <Card.Text>
                        <strong>Started:</strong> {new Date(job.startDate).toLocaleDateString()}<br />
                        <strong>Completed:</strong> {job.endDate !== 'TBD' ? new Date(job.endDate).toLocaleDateString() : 'TBD'}<br />
                        <strong>Final Amount:</strong> ${job.amount !== 'N/A' ? job.amount : '0.00'}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <Badge bg="success" pill>Completed</Badge>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => navigate(`/job-history/${job.jobId}`)}
                        >
                          View History
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {completedJobs.length === 0 && (
                <Col className="text-center py-4">
                  <p className="text-muted mb-0">No completed jobs yet. Jobs will appear here once they're finished.</p>
                </Col>
              )}
            </Row>
            {renderPagination(completedJobs, completedPage, setCompletedPage)}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default ClientJobs;