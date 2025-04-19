import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { Link } from 'react-router-dom';
import '../../styles/ClientJobs.css';


import { getJobsByClient, updateJobStatus } from '../../services/apiRoutes';  // Import the API functions

const ClientJobs = () => {
  const [openJobs, setOpenJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobsByClient();
        const allJobs = res.data;

        const open = allJobs.filter(job => job.status === 'open');
        const closed = allJobs
          .filter(job => job.status === 'closed')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOpenJobs(open);
        setPastJobs(closed);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = pastJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(pastJobs.length / jobsPerPage);
  
  const handleProposal = async (jobId, freelancerId, action) => {
    try {
      await updateJobStatus(jobId, { status: action }); 
      // Refresh jobs
      const res = await getJobsByClient();
      const allJobs = res.data;
  
      const open = allJobs.filter(job => job.status === 'open');
      const closed = allJobs
        .filter(job => job.status === 'closed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      setOpenJobs(open);
      setPastJobs(closed);
    } catch (err) {
      console.error(`Error handling proposal:`, err);
    }
  };
  
  return (
    <div className="client-jobs-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <button
          onClick={() => navigate('/client/post-job')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Post New Job
        </button>
      </div>

      {/* Current Proposals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Proposals</h2>
        {openJobs.length === 0 ? (
          <p className="text-gray-500">No current open jobs.</p>
        ) : (
          <div className="space-y-4">
          {openJobs.map(job => (
  <div key={job._id} className="border p-4 rounded-md shadow-sm">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.description}</p>
        <p className="text-sm mt-2">
          <strong>Proposals:</strong> {job.freelancers.length}
        </p>
      </div>
      <button
        onClick={() => navigate(`/jobs/${job._id}`)}
        className="text-blue-600 hover:underline"
      >
        View Job
      </button>
    </div>

    {/* Proposals section */}
    {job.freelancers.length > 0 && (
      <div className="mt-4 border-t pt-2">
        <h4 className="font-semibold text-sm mb-2">Proposals</h4>
        <ul className="space-y-2">
          {job.freelancers.map(freelancer => (
            <li
              key={freelancer._id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-medium">{freelancer.name}</p>
                <p className="text-sm text-gray-500">{freelancer.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleProposal(job._id, freelancer._id, 'accept')}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleProposal(job._id, freelancer._id, 'reject')}
                  className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
))}

          </div>
        )}
      </div>

      {/* Job History */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Job History</h2>
        {pastJobs.length === 0 ? (
          <p className="text-gray-500">No past jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {currentJobs.map(job => (
              <div key={job._id} className="border p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.description}</p>
                <p className="text-sm mt-2">
                  Completed on:{' '}
                  <span className="font-semibold">
                    {new Date(job.completedBy).toLocaleDateString()}
                  </span>
                </p>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex gap-2 justify-center mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientJobs;
