import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJobById,
  getCurrentUser,
  applyForJob,
  deleteJob,
  closeJob,
} from '../../services/apiRoutes';
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

  if (!job) return <p>Loading job details...</p>;


  return (
    <div className="max-w-5xl mx-auto mt-6 p-4">
      <h2 className="text-2xl font-semibold">{job.title}</h2>
      <p>{job.description}</p>
      <p><strong>Budget:</strong> ${job.budget}</p>
      <p><strong>Skills Required:</strong> {job.skillsRequired.join(', ')}</p>

      {userRole === 'client' ? 
        <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Proposals</h3>
        <ul className="space-y-2">
        {job.freelancers.map((freelancer) => (
            <li key={freelancer._id} className="flex justify-between items-center border p-2 rounded">
            <div>
                <p>{freelancer.name}</p>
                <p className="text-sm text-gray-500">{freelancer.email}</p>
            </div>
            {/* Optional: View proposal button, or move to ClientJobs */}
            </li>
        ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
        <button
            onClick={() => navigate(`/client/edit-job/${id}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
            Edit Job
        </button>
        <button
            onClick={() => handleJobAction('delete')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
            Delete Job
        </button>
        </div>
        </div>

  : userRole === 'freelancer' ? (
            <div className="mt-6">
            <button
                onClick={() => handleJobAction('apply')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Apply for Job
            </button>
            </div>
        ) : userRole === 'admin' ? (
            <div className="mt-6">
            <button
                onClick={() => handleJobAction('close')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Close Job
            </button>
            </div>
        ) : null}
    
        </div>
    );

  
};

export default JobDetails;
