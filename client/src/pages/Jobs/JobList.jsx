import React, { useEffect, useState, useCallback } from 'react';
import { getJobs } from '../../services/apiRoutes';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, Container, Row, Col, Form, Pagination } from "react-bootstrap";
import '../../styles/JobList.css';

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL or use defaults
  const selectedCategory = searchParams.get('category') || 'Development';
  const pageParam = parseInt(searchParams.get('page')) || 1;
  const searchParam = searchParams.get('search') || '';
  const minBudgetParam = parseInt(searchParams.get('minBudget')) || 0;
  const maxBudgetParam = parseInt(searchParams.get('maxBudget')) || 10000;

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState(searchParam);
  const [budgetRange, setBudgetRange] = useState([minBudgetParam, maxBudgetParam]);
  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);

  // Update URL
  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const params = {
        category: selectedCategory,
        page,
        limit: 12, // show 12 jobs per page for a nicer grid
        search,
        minBudget: budgetRange[0],
        maxBudget: budgetRange[1],
      };
      const res = await getJobs(params);
      if (res?.data?.jobs) {
        setJobs(res.data.jobs);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, [selectedCategory, page, search, budgetRange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Pagination helpers
  const goToPage = (newPage) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    updateURL({ search: e.target.value, page: 1 });
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudgetRange((prev) => {
      const newRange = name === 'minBudget'
        ? [parseInt(value), prev[1]]
        : [prev[0], parseInt(value)];
      setPage(1);
      updateURL({ minBudget: newRange[0], maxBudget: newRange[1], page: 1 });
      return newRange;
    });
  };

  // Smart pagination with ellipsis
  const renderPagination = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (page <= 3) endPage = Math.min(totalPages, maxVisible);
    if (page >= totalPages - 2) startPage = Math.max(1, totalPages - (maxVisible - 1));

    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => goToPage(1)}>1</Pagination.Item>);
      if (startPage > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => goToPage(i)}>
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      items.push(<Pagination.Item key={totalPages} onClick={() => goToPage(totalPages)}>{totalPages}</Pagination.Item>);
    }

    return (
      <Pagination className="justify-content-center mt-5">
        <Pagination.Prev onClick={() => goToPage(page - 1)} disabled={page === 1} />
        {items}
        <Pagination.Next onClick={() => goToPage(page + 1)} disabled={page === totalPages} />
      </Pagination>
    );
  };

  return (
    <Layout>
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">{selectedCategory} Jobs</h2>
          <p className="text-muted">Find your perfect freelance opportunity</p>
        </div>

        {/* Search */}
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={handleSearchChange}
              className="shadow-sm"
            />
          </Col>
        </Row>

        {/* Budget */}
        <Row className="g-3 justify-content-center mb-5">
          <Col xs={6} md={3}>
            <Form.Group controlId="minBudget">
              <Form.Label>Min Budget</Form.Label>
              <Form.Control
                type="number"
                name="minBudget"
                value={budgetRange[0]}
                onChange={handleBudgetChange}
                placeholder="₹ Min"
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={3}>
            <Form.Group controlId="maxBudget">
              <Form.Label>Max Budget</Form.Label>
              <Form.Control
                type="number"
                name="maxBudget"
                value={budgetRange[1]}
                onChange={handleBudgetChange}
                placeholder="₹ Max"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Job Cards */}
        <Row className="g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Col key={job._id} className="d-flex">
                <Card className="h-100 shadow-sm border-0 d-flex flex-column">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-2">
                      <Link to={`/jobs/${job._id}`} className="text-decoration-none text-dark fw-bold">
                        {job.title}
                      </Link>
                    </Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">
                      {job.description.length > 100
                        ? `${job.description.slice(0, 100)}...`
                        : job.description}
                    </Card.Text>
                    <div className="mt-3">
                      <Card.Text className="mb-1">
                        <strong>Budget:</strong> ₹{job.budget}
                      </Card.Text>
                      <Card.Text className="mb-0">
                        <strong>Skills:</strong> {job.skillsRequired.join(", ")}
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No jobs found.</p>
            </div>
          )}
        </Row>

        {/* Pagination */}
        {renderPagination()}
      </Container>
    </Layout>
  );
};

export default JobList;
