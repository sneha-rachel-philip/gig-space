import React, { useEffect, useState, useCallback } from 'react';
import {getJobs} from '../../services/apiRoutes';
//import { getJobsByCategory } from '../../services/apiRoutes';
import { useLocation } from 'react-router-dom';
import '../../styles/JobList.css'; // Assuming you have a CSS file for styling
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout'; // Assuming you have a Layout component for consistent styling
import { Card, Button, Container, Row, Col, Form } from "react-bootstrap";

const JobList = () => {
  const location = useLocation();
  const selectedCategory = new URLSearchParams(location.search).get('category') || 'Development';

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Function to fetch jobs based on filters
  const fetchJobs = useCallback(async () => {
    try {
      const params = {
        category: selectedCategory,
        page,
        limit: 10,
        search,
        minBudget: budgetRange[0],
        maxBudget: budgetRange[1],
      };

      //console.log('Fetching jobs with params:', params);
      const res = await getJobs(params); 
     // console.log('API Response:', res);

      // Checking if response contains jobs and updating the state
      if (res && res.data && res.data.jobs) {
        setJobs(res.data.jobs);  // Set the jobs in the state
        //console.log('Jobs fetched:', res.data.jobs);
        setTotalPages(res.data.pages || 1); // Set the total number of pages
      } else {
        console.error('No jobs found in the response.');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, [selectedCategory, page, search, budgetRange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // Fetch jobs when dependencies change

  // Pagination handling
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search term changes
  };

  // Handle budget range change
  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudgetRange((prevRange) => {
      if (name === 'minBudget') {
        return [parseInt(value), prevRange[1]];
      }
      return [prevRange[0], parseInt(value)];
    });
    setPage(1); // Reset to first page when budget range changes
  };

  return (
    <Layout>


<Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">{selectedCategory} Jobs</h2>
          <p className="text-muted">Find your perfect freelance opportunity</p>
        </div>

        {/* Search Bar */}
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Form>
              <Form.Control
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={handleSearchChange}
                className="shadow-sm"
              />
            </Form>
          </Col>
        </Row>

        {/* Budget Filter */}
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
        <Row className="g-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Col key={job._id} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
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

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center gap-3 mt-5">
          <Button
            variant="primary"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </Container>
  
   </Layout>

  );
};

export default JobList;




/* 
const JobList = () => {
  const location = useLocation();
  const selectedCategory = new URLSearchParams(location.search).get('category') || 'Development';
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchCategoryJobs = async () => {
      try {
        const res = await getJobsByCategory({ category: selectedCategory });
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchCategoryJobs();
  }, [selectedCategory]);

 
  return (
    <div className="joblist-container">
      <h2>{selectedCategory} Jobs</h2>
      <div className="job-cards">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="job-card" key={job._id}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>Budget:</strong> ₹{job.budget}</p>
              <p><strong>Skills:</strong> {job.skillsRequired.join(', ')}</p>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default JobList; */

