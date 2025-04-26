/* import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobsByClient, updateJobStatus,getProposalsForJob, acceptProposal, rejectProposal} from '../../services/apiRoutes';
//import { Link } from 'react-router-dom';
import '../../styles/ClientJobs.css'; */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getJobsByClient,
  updateJobStatus,
  getProposalsForJob,
  acceptProposal,
  rejectProposal,
} from '../../services/apiRoutes';

import '../../styles/ClientJobs.css';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

const ClientJobs = () => {
  const [proposals, setProposals] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  const [proposalPage, setProposalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientJobsAndProposals();
  }, []);

  const fetchClientJobsAndProposals = async () => {
    try {
      const jobRes = await getJobsByClient();
      const allJobs = jobRes.data;

      const currentProposals = [];
      const ongoingJobs = [];
      const finishedJobs = [];
      for (const job of allJobs) {
        const proposalRes = await getProposalsForJob(job._id);
        const jobProposals = proposalRes.data;
      
        if (job.status === 'open') {
          if (jobProposals.length > 0) {
            jobProposals.forEach((p) => {
              const freelancer = p.freelancer;
      
              currentProposals.push({
                jobId: job._id,
                title: job.title,
                createdAt: job.createdAt,
                freelancerName: freelancer?.name || '—',
                amount: p.proposedBudget,
                status: p.status,
                freelancerId: freelancer?._id || null,
                proposalId: p._id,
              });
            });
          } else {
            currentProposals.push({
              jobId: job._id,
              title: job.title,
              createdAt: job.createdAt,
              freelancerName: '—',
              amount: '—',
              status: 'No proposals yet',
              freelancerId: null,
              proposalId: null,
            });
          }
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
      

      setProposals(currentProposals);
      setCurrentJobs(ongoingJobs);
      setCompletedJobs(finishedJobs);
    } catch (err) {
      console.error('Error fetching client jobs/proposals:', err);
    }
  };

  const handleProposal = async (jobId, freelancerId, proposalId, action) => {
    try {
      // Update backend: job + proposal status
      await updateJobStatus(jobId, { status: action, freelancerId });

      if (action === 'accept') {
        await acceptProposal(proposalId);
      } else if (action === 'reject') {
        await rejectProposal(proposalId);
      }

      // Refresh UI
      await fetchClientJobsAndProposals();
    } catch (err) {
      console.error('Error handling proposal:', err);
    }
  };

  const paginate = (data, page) => data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
 return(
  <div className="client-jobs-container">
  <button onClick={() => navigate('/client/post-job')}>
    + Post New Job
  </button>

  <h2>Current Proposals</h2>
  <table>
    <thead>
      <tr>
        <th>Job Title</th>
        <th>Date Created</th>
        <th>Status</th>
        <th>Freelancer</th>
        <th>Bid Amount</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {paginate(proposals, proposalPage).map((item, idx) => (
        <tr key={idx}>
          <td>{item.title}</td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
          <td>{item.status}</td>
          <td>{item.freelancerName}</td>
          <td>${item.amount}</td>
          <td>
            {item.status !== 'accepted' && item.status !== 'rejected' && item.proposalId && (
              <>
                <button onClick={() => handleProposal(item.jobId, item.freelancerId, item.proposalId, 'accept')}>
                  Accept
                </button>
                <button onClick={() => handleProposal(item.jobId, item.freelancerId, item.proposalId, 'reject')}>
                  Reject
                </button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="pagination">
    <button onClick={() => setProposalPage((p) => Math.max(0, p - 1))} disabled={proposalPage === 0}>
      Prev
    </button>
    <button
      onClick={() =>
        setProposalPage((p) => (p + 1) * ITEMS_PER_PAGE < proposals.length ? p + 1 : p)
      }
      disabled={(proposalPage + 1) * ITEMS_PER_PAGE >= proposals.length}
    >
      Next
    </button>
  </div>

  <h2>Current Jobs</h2>
  <table>
    <thead>
      <tr>
        <th>Job Title</th>
        <th>Start Date</th>
        <th>End Date</th>
        
      </tr>
    </thead>
    <tbody>
      {paginate(currentJobs, currentPage).map((item, idx) => (
        <tr key={idx}>
          
          <td><Link to={`/job-area/${item.jobId}`}>{item.title}</Link></td>
          <td>{new Date(item.startDate).toLocaleDateString()}</td>
          <td>{item.endDate !== 'TBD' ? new Date(item.endDate).toLocaleDateString() : 'TBD'}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="pagination">
    <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
      Prev
    </button>
    <button
      onClick={() =>
        setCurrentPage((p) => (p + 1) * ITEMS_PER_PAGE < currentJobs.length ? p + 1 : p)
      }
      disabled={(currentPage + 1) * ITEMS_PER_PAGE >= currentJobs.length}
    >
      Next
    </button>
  </div>

  <h2>Completed Jobs</h2>
  <table>
    <thead>
      <tr>
        <th>Job Title</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {paginate(completedJobs, completedPage).map((item, idx) => (
        <tr key={idx}>
          <td>{item.title}</td>
          <td>{new Date(item.startDate).toLocaleDateString()}</td>
          <td>{item.endDate !== 'TBD' ? new Date(item.endDate).toLocaleDateString() : 'TBD'}</td>
          <td>${item.amount}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="pagination">
    <button onClick={() => setCompletedPage((p) => Math.max(0, p - 1))} disabled={completedPage === 0}>
      Prev
    </button>
    <button
      onClick={() =>
        setCompletedPage((p) => (p + 1) * ITEMS_PER_PAGE < completedJobs.length ? p + 1 : p)
      }
      disabled={(completedPage + 1) * ITEMS_PER_PAGE >= completedJobs.length}
    >
      Next
    </button>
  </div>
</div>

 );
};

export default ClientJobs;