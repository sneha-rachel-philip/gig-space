import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/FreelancerJobs.css';

const FreelancerJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch freelancer jobs here
    setMyJobs([
      {
        id: 1,
        title: 'Build a landing page',
        status: 'In Progress',
        budget: 500,
      },
      {
        id: 2,
        title: 'Logo design for startup',
        status: 'Completed',
        budget: 200,
      }
    ]);
  }, []);

  const handleBrowseJobs = () => {
    navigate('/jobs/categories');
  };

  return (
    <div className="freelancer-jobs-container flex">
      <div className="freelancer-jobs-content p-6">
        <h2 className="text-2xl font-semibold mb-6">My Jobs</h2>

        <button className="browse-jobs-btn" onClick={handleBrowseJobs}>
          Browse More Jobs
        </button>

        {myJobs.length > 0 ? (
          <div className="job-list mt-6">
            {myJobs.map(job => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p>Status: <span className={`status ${job.status.toLowerCase()}`}>{job.status}</span></p>
                <p>Budget: ${job.budget}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4">No jobs assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default FreelancerJobs;
