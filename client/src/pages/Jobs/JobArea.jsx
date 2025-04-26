import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobById } from '../../services/apiRoutes'; // adjust path as needed
import { useAuth } from '../../context/useAuth';
import '../../styles/JobArea.css'; 
import FileUploadSection from '../../components/FileUploadSection';
import JobChat from '../../components/JobChat';


const JobArea = () => {
  const { jobId } = useParams();
  const { user } = useAuth(); // assume this gives user info
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJobById(jobId);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
     }, [jobId]);

    if (loading) return <div className="job-area">Loading...</div>;
     if (!job) return <div className="job-area">Job not found.</div>;

  

     const isClient = user.role === 'client';
    const isFreelancer = user.role === 'freelancer';

    

  return (
    <div className="job-area">
      <h1>{job.title}</h1>
      <p className="job-description">{job.description}</p>
        <p className="job-status">Status: {job.status}</p>
        <p className="job-details">Client: {job?.client?.name || '—'}</p>
        <p className="job-details">Freelancer: {job?.assignedFreelancer?.name || '—'}</p>
      <div className="job-section">
        <h2>Contract</h2>
        <p>Start: {new Date(job.createdAt).toLocaleDateString()}</p>
        <p>Deadline: {job.completedBy ? new Date(job.completedBy).toLocaleDateString() : 'TBD'}</p>
        <p>Budget: ${job.budget}</p>
        <p>Skills: {job.skillsRequired.join(', ')}</p>
        {/* Add edit/accept buttons here if needed */}
      </div>

      <div className="contract-section">
        <h2>Contract Agreement</h2>

        <p><strong>Client:</strong> {job?.client?.name}</p>
        <p><strong>Freelancer:</strong> {job?.assignedFreelancer?.name}</p>
        <p><strong>Project Title:</strong> {job?.title}</p>
        <p><strong>Budget:</strong> ${job?.budget}</p>
        <p><strong>Deadline:</strong> {formatDate(job?.completedBy)}</p>

        <div className="contract-terms">
            <h3>Terms & Conditions</h3>
            <p>
            This agreement outlines the scope of work between <strong>{job?.client?.name}</strong> and <strong>{job?.assignedFreelancer?.name}</strong> 
            for the project titled <strong>{job?.title}</strong>. The freelancer agrees to deliver the required work by <strong>{formatDate(job?.completedBy)}</strong> 
            in exchange for the agreed-upon budget of <strong>${job?.budget}</strong>.
            </p>
        </div>

        {/* Optional: Show accept/decline buttons for freelancer if needed */}
        {user?.role === 'freelancer' && (
            <div className="contract-actions">
            <button className="accept-btn">Accept</button>
            <button className="decline-btn">Decline</button>
            </div>
        )}
        </div>

        




      <div className="job-section">
        <h2>Milestones & Payments</h2>
        <ul>
          {job.milestones.map((m, idx) => (
            <li key={idx}>{m}</li>
          ))}
        </ul>
        {/* Add milestone payment status, release buttons etc. later */}
      </div>

      <div className="section">
            <h3>📁 Files</h3>
            {job.files?.length > 0 ? (
                <ul>
                {job.files.map((f) => (
                    <li key={f._id}>
                    <a href={`/uploads/${f.filename}`} target="_blank" rel="noopener noreferrer">
                        {f.originalname}
                    </a>
                    <span> (uploaded at {new Date(f.uploadedAt).toLocaleString()})</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p>No files uploaded yet.</p>
            )}

            <FileUploadSection jobId={job._id} onUploadSuccess={() => {
                // refresh file list after upload
                setLoading(true);
                getJobById(jobId).then((res) => {
                setJob(res.data);
                setLoading(false);
                });
            }} />
            </div>
        

      <div className="job-section">
        <h2>Messages</h2>
            <JobChat jobId={jobId} user={user} />
      </div>
    </div>
  );
};

export default JobArea;
