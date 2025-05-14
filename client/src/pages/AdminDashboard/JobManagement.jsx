import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import {
  getAllJobsForAdmin,
  getFlaggedJobs,
  unflagJob,
  deleteJob,
} from '../../services/apiRoutes';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [flaggedJobs, setFlaggedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sort: 'date',
    page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await getAllJobsForAdmin(filters);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    }
    setLoading(false);
  };

  const fetchFlaggedJobs = async () => {
    try {
      const { data } = await getFlaggedJobs();
      setFlaggedJobs(Array.isArray(data?.jobs) ? data.jobs : []);

    } catch (err) {
      console.error('Failed to fetch flagged jobs:', err);
        setFlaggedJobs([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchFlaggedJobs();
  }, [filters]);

  const handleUnflag = async (jobId) => {
    if (window.confirm('Unflag this job?')) {
      await unflagJob(jobId);
      fetchJobs();
      fetchFlaggedJobs();
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await deleteJob(jobId);
      fetchJobs();
      fetchFlaggedJobs();
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => ({
      ...prev,
      page: direction === 'next' ? prev.page + 1 : Math.max(1, prev.page - 1),
    }));
  };

  return (
    <div>
      <h2>Flagged Jobs</h2>
      {flaggedJobs?.length === 0 ? (
        <p>No flagged jobs.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Flag Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedJobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.status}</td>
                <td>{job.category}</td>
                <td>{job.flags.length}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleUnflag(job._id)}>
                    Unflag
                  </Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(job._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <hr />

      <h2>All Jobs</h2>

      <Form className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="inprogress">In Progress</option>
              <option value="closed">Closed</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="date">Sort by Date</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.status}</td>
                <td>{job.category}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(job._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-between mt-3">
        <Button
          disabled={filters.page === 1}
          onClick={() => handlePageChange('prev')}
        >
          Previous
        </Button>
        <span>Page {filters.page}</span>
        <Button
          disabled={filters.page === totalPages}
          onClick={() => handlePageChange('next')}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default JobManagement;
