import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getJobById, createStripeCheckoutSession, getContractByJobId, updateContractStatus, markMilestoneAsDone } from '../../services/apiRoutes';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import FileUploadSection from '../../components/FileUploadSection';
import JobChat from '../../components/JobChat';
import { toast, ToastContainer } from 'react-toastify';

const JobArea = () => {
  const { jobId } = useParams();
  const { currentUser: user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const getPaidMilestoneLabels = contract?.milestonePayments.filter(m => m.paidAt).map(m => m.label) || [];


  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  const fetchData = useCallback(async () => {
    try {
      const jobRes = await getJobById(jobId);
      setJob(jobRes.data);
  
      const contractRes = await getContractByJobId(jobId);
      setContract(contractRes.data);
      setContractStatus(contractRes.data.status);
    } catch (err) {
      console.error('Error fetching job or contract:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState([]);

  const handleConfirmMarkDone = async () => {
    if (!selectedMilestone) return;
  
    try {
      await markMilestoneAsDone(contract._id, selectedMilestone);
      const updatedContract = await getContractByJobId(jobId);
      setContract(updatedContract.data);
      setCompletedMilestones(prev => [...prev, selectedMilestone]);

    } catch (err) {
      console.error("Error marking milestone as done:", err);
      alert("Failed to mark milestone as done.");
    }
  };
  
  

  const handleAcceptContract = async () => {
    try {
      const response = await updateContractStatus(contract._id, 'active');
      if (response.data?.message?.includes('Contract status updated')) {
        setContractStatus('active');
        toast.success('Contract accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting contract:', error);
      toast.error('Error accepting contract.');
    }
  };

  const handleDeclineContract = async () => {
    try {
      const response = await updateContractStatus(contract._id, 'cancelled');
      if (response.data?.message?.includes('Contract status updated')) {
        setContractStatus('cancelled');
        toast.error('Contract declined.');
      }
    } catch (error) {
      console.error('Error declining contract:', error);
      toast.error('Error declining contract.');
    }
  };

  const handleMilestonePayment = async (milestone) => {
    const amount = prompt(`Enter payment amount for "${milestone}"`);
    if (!amount || isNaN(amount)) return;

    try {
      const res = await createStripeCheckoutSession({
        amount: parseFloat(amount),
        milestoneLabel: milestone,
        contractId: contract?._id,
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data.error || 'Payment failed.');
      }
    } catch (err) {
      console.error('Payment error', err);
      alert('Something went wrong.');
    }
  };
/*   console.log('Paid Milestone Labels:', getPaidMilestoneLabels);
  console.log('Contract Object:', contract); */
/*   console.log('Milestones:', job.milestones);
console.log('Paid Milestones Labels:', getPaidMilestoneLabels); */



  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (!job) return <div className="container mt-5 alert alert-danger">Job not found.</div>;

  const isClient = user?.role === 'client';
  const isFreelancer = contract?.freelancer?._id === user?._id;
  


  return (
    <div className="container py-4">
      {/* Job Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold text-primary">{job.title}</h1>
          <div className="badge bg-secondary mb-2">{job.status}</div>
          <p className="lead">{job.description}</p>
          <div className="d-flex text-muted mb-3">
            <div className="me-3"><i className="bi bi-person-fill"></i> Client: {job?.client?.name || '—'}</div>
            <div><i className="bi bi-person-circle"></i> Freelancer: {job?.assignedFreelancer?.name || '—'}</div>
          </div>
        </div>
      </div>

      {/* Main content in two columns */}
      <div className="row">
        {/* Left Column */}
        <div className="col-md-8">
          {/* Contract Details */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h2 className="h4 mb-0"><i className="bi bi-file-earmark-text me-2"></i>Contract</h2>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <p className="mb-1 fw-bold">Start Date:</p>
              <p>{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="mb-1 fw-bold">Deadline:</p>
              <p>{formatDate(job?.completedBy)}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="mb-1 fw-bold">Budget:</p>
              <p className="text-success fw-bold">${job.budget}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="mb-1 fw-bold">Required Skills:</p>
              <p>{job.skillsRequired.map(skill => (
                <span key={skill} className="badge bg-info text-dark me-1">{skill}</span>
              ))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Agreement */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h2 className="h4 mb-0"><i className="bi bi-clipboard-check me-2"></i>Contract Agreement</h2>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <p className="mb-1 fw-bold">Client:</p>
              <p>{job?.client?.name}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1 fw-bold">Freelancer:</p>
              <p>{job?.assignedFreelancer?.name}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1 fw-bold">Project Title:</p>
              <p>{job?.title}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1 fw-bold">Budget:</p>
              <p className="text-success fw-bold">${job?.budget}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1 fw-bold">Deadline:</p>
              <p>{formatDate(job?.completedBy)}</p>
            </div>
          </div>

          <div className="contract-terms border-top pt-3 mt-2">
            <h3 className="h5 mb-3">Terms & Conditions</h3>
            <p className="text-justify" style={{ textAlign: 'justify', maxWidth: '800px', margin: '0 auto' }}>
              This agreement outlines the scope of work between <strong>{job?.client?.name}</strong> and <strong>{job?.assignedFreelancer?.name}</strong> for 
              the project titled <strong>{job?.title}</strong>. The freelancer agrees to deliver the required work by <strong>{formatDate(job?.completedBy)}</strong> in 
              exchange for the agreed-upon budget of <strong>${job?.budget}</strong>.
            </p>
          </div>

          {/* Show accept/decline buttons only if the contract is not yet accepted or declined */}
          <ToastContainer />
              {user?.role === 'freelancer' && contractStatus !== 'active' && contractStatus !== 'cancelled' && (
                <div className="d-flex gap-2 mt-3">
                  <button onClick={handleAcceptContract} className="btn btn-success">Accept Contract</button>
                  <button onClick={handleDeclineContract} className="btn btn-outline-danger">Decline</button>
                </div>
              )}
              {contractStatus === 'active' && (
                <button className="btn btn-success mt-3" disabled>Contract Accepted</button>
              )}
        </div>
      </div>

          {/* Milestones & Payments */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-flag me-2"></i>Milestones & Payments</h2>
            </div>
            <div className="card-body">
              {job.milestones.length > 0 ? (
                <div className="list-group">
                    {job.milestones.map((milestone, idx) => {
                      const isPaid = getPaidMilestoneLabels.includes(milestone);
                      const contractMilestone = contract?.milestonePayments?.find(m => m.label === milestone);
                      const isCompleted = contractMilestone?.completedByFreelancer;

                      return (
                        <div
                          key={idx}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span className="badge bg-primary rounded-pill me-2">{idx + 1}</span>
                            {milestone}
                            {isPaid && <span className="badge bg-success ms-2">Paid</span>}
                            {!isPaid && isCompleted && <span className="badge bg-warning text-dark ms-2">Marked as done</span>}
                          </div>
                    
                          {isClient && !isPaid && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleMilestonePayment(milestone, idx)}
                            >
                              Release Payment
                            </button>
                          )}
                    
                          {isFreelancer && !isPaid && (
                            <button
                              className="btn btn-sm btn-outline-warning ms-3"
                              data-bs-toggle="modal"
                              data-bs-target="#confirmMarkDoneModal"
                              onClick={() => setSelectedMilestone(milestone)} 
                              disabled={isCompleted || completedMilestones.includes(milestone)} 

                            >
                              Mark as Done
                            </button>

                          )}
                        </div>
                      );
                    })}


                </div>
              ) : (
                <p className="text-muted">No milestones defined for this project.</p>
              )}
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="confirmMarkDoneModal"
          tabIndex="-1"
          aria-labelledby="confirmMarkDoneModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="confirmMarkDoneModalLabel">
                  Confirm Milestone Completion
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to mark "<strong>{selectedMilestone}</strong>" as done?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleConfirmMarkDone}
                  data-bs-dismiss="modal"
                >
                  Yes, Mark as Done
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Right Column */}
        <div className="col-md-4">
          {/* Files Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-folder me-2"></i>Files</h2>
            </div>
            <div className="card-body">
              {job.files?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {job.files.map((f) => (
                    <li key={f._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <i className="bi bi-file-earmark me-2"></i>
                        <a href={`/uploads/${f.filename}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {f.originalname}
                        </a>
                        <small className="d-block text-muted mt-1">
                          Uploaded: {new Date(f.uploadedAt).toLocaleString()}
                        </small>
                      </div>
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-download"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No files uploaded yet.</p>
              )}

              <div className="mt-3">
                <FileUploadSection 
                  jobId={job._id} 
                  onUploadSuccess={() => {
                    // refresh file list after upload
                    setLoading(true);
                    getJobById(jobId).then((res) => {
                      setJob(res.data);
                      setLoading(false);
                    });
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Optional: Extra info cards */}
          <div className="card shadow-sm mb-4 bg-light">
            <div className="card-body">
              <h5 className="card-title">Project Timeline</h5>
              <div className="d-flex justify-content-between text-muted mb-1">
                <small>Start</small>
                <small>Deadline</small>
              </div>
              <div className="progress mb-3" style={{ height: "20px" }}>
                <div 
                  className="progress-bar bg-info" 
                  role="progressbar" 
                  style={{ width: "50%" }}
                  aria-valuenow="50" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  50%
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <small>{new Date(job.createdAt).toLocaleDateString()}</small>
                <small>{formatDate(job.completedBy)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-light">
          <h2 className="h4 mb-0"><i className="bi bi-chat-dots me-2"></i>Messages</h2>
        </div>
        <div className="card-body">
          <JobChat jobId={jobId} user={user} />
        </div>
      </div>
    </div>
  );
};

export default JobArea;