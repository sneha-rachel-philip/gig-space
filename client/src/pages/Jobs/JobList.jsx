import React, { useEffect, useState, useCallback } from 'react';
import {getJobs} from '../../services/apiRoutes';
//import { getJobsByCategory } from '../../services/apiRoutes';
import { useLocation } from 'react-router-dom';
import '../../styles/JobList.css'; // Assuming you have a CSS file for styling
import { Link } from 'react-router-dom';


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
        limit: 5,
        search,
        minBudget: budgetRange[0],
        maxBudget: budgetRange[1],
      };

      console.log('Fetching jobs with params:', params);
      const res = await getJobs(params); 
      console.log('API Response:', res);

      // Checking if response contains jobs and updating the state
      if (res && res.data && res.data.jobs) {
        setJobs(res.data.jobs); // Set the jobs in the state
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
    <div className="joblist-container">
      <h2>{selectedCategory} Jobs</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title or description"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Budget Filter */}
      <div className="budget-filter">
        <label>
          Min Budget:
          <input
            type="number"
            name="minBudget"
            value={budgetRange[0]}
            onChange={handleBudgetChange}
          />
        </label>
        <label>
          Max Budget:
          <input
            type="number"
            name="maxBudget"
            value={budgetRange[1]}
            onChange={handleBudgetChange}
          />
        </label>
      </div>

      <div className="job-cards">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="job-card hover:shadow-md transition-shadow p-4 rounded bg-white">
              <Link to={`/jobs/${job._id}`} className="block text-decoration-none">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                </Link>
              <p>{job.description}</p>
              <p><strong>Budget:</strong> ₹{job.budget}</p>
              <p><strong>Skills:</strong> {job.skillsRequired.join(', ')}</p>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
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

