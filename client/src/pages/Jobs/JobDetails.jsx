import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJobById,
  getCurrentUser,
  applyForJob,
  deleteJob,
  closeJob,
  submitProposal,
} from '../../services/apiRoutes';
import '../../styles/JobDetails.css';



const JobDetails = () => {
  const { id } = useParams(); // Get the job ID from the URL
  const [job, setJob] = useState(null);
  const [userRole, setUserRole] = useState(''); // To store the user role (client, freelancer, admin)
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch job details by ID
    const fetchJobDetails = async () => {
      try {
        const response = await getJobById(id);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    // Fetch user role from the auth context or an API
    const fetchUserRole = async () => {
      try {
        const response = await getCurrentUser(); // Example API to get user role
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchJobDetails();
    fetchUserRole();
  }, [id]);

  const handleJobAction = async (action) => {
    try {
      if (action === 'apply') {
        await applyForJob(id);
        alert('Successfully applied for the job!');
      } else if (action === 'delete') {
        await deleteJob(id);
        alert('Job deleted successfully!');
        navigate(userRole === 'admin' ? '/admin/jobs' : '/client/dashboard');
      } else if (action === 'close') {
        await closeJob(id);
        alert('Job closed successfully!');
      } else if (action === 'edit') {
        navigate(`/admin/edit-job/${id}`);
      }
    } catch (error) {
      console.error(`Error performing action (${action}):`, error);
      alert(`Something went wrong while trying to ${action} the job.`);
    }
  };



  const [proposalText, setProposalText] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await submitProposal({
        jobId: id,
        proposalText,
        proposedBudget,
        proposedDuration,
      });
      console.log('Proposal response:', response.data);
      setSubmitMessage('Proposal submitted successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Failed to submit proposal.';
      setSubmitMessage(errorMessage);
    }
  };
  
  if (!job) return <p>Loading job details...</p>;



  return (
    <div className="job-details-container">
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <p><strong>Budget:</strong> ${job.budget}</p>
      <p><strong>Skills Required:</strong> {job.skillsRequired.join(', ')}</p>

      {userRole === 'client' ? (
        <div className="proposals-section">
          <h3>Proposals</h3>
          <ul className="proposals-list">
            {job.freelancers.map((freelancer) => (
              <li key={freelancer._id} className="proposal-item">
                <div>
                  <p>{freelancer.name}</p>
                  <p className="email">{freelancer.email}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="button-group">
            <button
              onClick={() => navigate(`/client/edit-job/${id}`)}
              className="button button-yellow"
            >
              Edit Job
            </button>
            <button
              onClick={() => handleJobAction('delete')}
              className="button button-red"
            >
              Delete Job
            </button>
          </div>
        </div>
      ) : userRole === 'freelancer' ? (
        <div className="bid-form-container">
          <h3>Place Your Bid</h3>
          <form onSubmit={handleProposalSubmit} className="bid-form">
            <textarea
              placeholder="Proposal details..."
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Proposed Budget ($)"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Proposed Duration (e.g., 5 days)"
              value={proposedDuration}
              onChange={(e) => setProposedDuration(e.target.value)}
              required
            />
            <button type="submit" className="button button-blue">
              Submit Proposal
            </button>
          </form>
          {submitMessage && <p className="submit-message">{submitMessage}</p>}
        </div>
      ) : userRole === 'admin' ? (
        <div className="admin-controls">
          <button
            onClick={() => handleJobAction('close')}
            className="button button-green"
          >
            Close Job
          </button>
        </div>
      ) : null}
    </div>
  );

  
};




export default JobDetails;
