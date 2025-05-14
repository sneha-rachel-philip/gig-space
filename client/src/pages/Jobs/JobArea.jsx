import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getJobById,
  createStripeCheckoutSession,
  getContractByJobId,
  updateContractStatus,
  markMilestoneAsDone,
  updateJobStatus,
  getReviewsForJob,
} from '../../services/apiRoutes';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Badge, 
  Button, Spinner, Alert, ProgressBar, 
  ListGroup, Modal, Form
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import FileUploadSection from '../../components/FileUploadSection';
import JobChat from '../../components/JobChat';
import ReviewForm from '../../components/ReviewForm';
import FlagJobButton from '../../components/FlagJobButton';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

const JobArea = () => {
  const { jobId } = useParams();
  const { currentUser: user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [contractProgress, setContractProgress] = useState(0);

  // Computed properties
  const getPaidMilestoneLabels = contract?.milestonePayments?.filter(m => m.paidAt).map(m => m.label) || [];
  const allMilestonesPaid = contract?.milestonePayments?.every(m => m.paidAt);
  const isClient = user?.role === 'client';
  const isFreelancer = contract?.freelancer?._id === user?._id;

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  const calculateProgress = useCallback(() => {
    if (!job || !job.milestones || job.milestones.length === 0) return 0;
    
    const total = job.milestones.length;
    const paid = getPaidMilestoneLabels.length;
    return Math.round((paid / total) * 100);
  }, [job, getPaidMilestoneLabels]);

  const fetchData = useCallback(async () => {
    try {
      const jobRes = await getJobById(jobId);
      setJob(jobRes.data);
  
      const contractRes = await getContractByJobId(jobId);
      setContract(contractRes.data);
      setContractStatus(contractRes.data.status);
      
      try {
        const reviewsRes = await getReviewsForJob(jobId);
        const reviewsData = reviewsRes.data;
        setUserReviews(reviewsData.reviews || []);
        
        // Check if current user has already left a review
        const hasReviewed = reviewsData.reviews?.some(review => review.reviewerId === user?._id);
        setCanReview(!hasReviewed);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setCanReview(true); // Allow review if we can't determine if user has already reviewed
      }
    } catch (err) {
      console.error('Error fetching job or contract:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId, user?._id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    setContractProgress(calculateProgress());
  }, [calculateProgress]);

  const handleConfirmMarkDone = async () => {
    if (!selectedMilestone) return;
  
    try {
      await markMilestoneAsDone(contract._id, selectedMilestone);
      const updatedContract = await getContractByJobId(jobId);
      setContract(updatedContract.data);
      setCompletedMilestones(prev => [...prev, selectedMilestone]);
      setShowMarkDoneModal(false);
      toast.success(`Milestone "${selectedMilestone}" marked as completed!`);
    } catch (err) {
      console.error("Error marking milestone as done:", err);
      toast.error("Failed to mark milestone as done.");
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

  const handleMilestonePayment = async (milestoneLabel, idx) => {
    const milestoneDet = contract?.milestonePayments?.[idx];
    if (!milestoneLabel || !milestoneDet) return toast.error('Invalid milestone.');
    
    const expectedAmount = milestoneDet?.amount;
    const amount = prompt(`Pay the exact amount for "${milestoneDet.label}" (Expected: ₹${expectedAmount})`);
    
    if (!amount || isNaN(amount)) return toast.error('Invalid amount entered.');
    if (parseFloat(amount) !== expectedAmount) {
      return toast.error(`Amount must be exactly ₹${expectedAmount}`);
    }
  
    try {
      const res = await createStripeCheckoutSession({
        amount: expectedAmount,
        milestoneLabel: milestoneLabel,
        contractId: contract?._id,
      });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.data.error || 'Payment failed.');
      }
    } catch (err) {
      console.error('Payment error', err);
      toast.error('Something went wrong with payment processing.');
    }
  };

  const handleCloseJob = async () => {
    try {
      await updateJobStatus(jobId, { status: 'closed' });
      toast.success('Job closed successfully!');
      setJob(prev => ({ ...prev, status: 'closed' })); 
    } catch (err) {
      console.error('Error closing job:', err);
      toast.error('Failed to close the job.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (!job) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Job not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Job Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 fw-bold text-primary">{job.title}</h1>
          <Badge bg={job.status === 'active' ? 'success' : 
                  job.status === 'closed' ? 'secondary' : 
                  job.status === 'cancelled' ? 'danger' : 'primary'} 
                 className="mb-2">
            {job.status}
          </Badge>
          <p className="lead">{job.description}</p>
          <div className="d-flex text-muted mb-3 flex-wrap gap-3">
            <div>
              <i className="bi bi-person-fill me-1"></i> 
              Client: {' '}
              <Link to={`/user/${job?.client?._id}/profile`} className="text-decoration-none">
                {job?.client?.name || '—'}
              </Link>
            </div>

            <div>
              <i className="bi bi-person-circle me-1"></i> 
              Freelancer: {' '}
              <Link to={`/user/${job?.assignedFreelancer?._id}/profile`} className="text-decoration-none">
                {job?.assignedFreelancer?.name || '—'}
              </Link>
            </div>

            <div className="ms-auto">
              <FlagJobButton jobId={job._id} />
            </div>
          </div>
        </Col>
      </Row>

      {/* Main content in two columns */}
      <Row>
        {/* Left Column */}
        <Col md={8}>
          {/* Contract Details */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-file-earmark-text me-2"></i>Contract</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <p className="mb-1 fw-bold">Start Date:</p>
                  <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p className="mb-1 fw-bold">Deadline:</p>
                  <p>{formatDate(job?.completedBy)}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p className="mb-1 fw-bold">Budget:</p>
                  <p className="text-success fw-bold">₹{job.budget}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <p className="mb-1 fw-bold">Required Skills:</p>
                  <p>
                    {job.skillsRequired.map(skill => (
                      <Badge bg="info" text="dark" className="me-1" key={skill}>{skill}</Badge>
                    ))}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Contract Agreement */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-clipboard-check me-2"></i>Contract Agreement</h2>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1 fw-bold">Client:</p>
                  <p>{job?.client?.name}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 fw-bold">Freelancer:</p>
                  <p>{job?.assignedFreelancer?.name}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 fw-bold">Project Title:</p>
                  <p>{job?.title}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 fw-bold">Budget:</p>
                  <p className="text-success fw-bold">₹{job?.budget}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 fw-bold">Deadline:</p>
                  <p>{formatDate(job?.completedBy)}</p>
                </Col>
              </Row>

              <div className="contract-terms border-top pt-3 mt-2">
                <h3 className="h5 mb-3">Terms & Conditions</h3>
                <p className="text-justify" style={{ textAlign: 'justify', maxWidth: '800px', margin: '0 auto' }}>
                  This agreement outlines the scope of work between <strong>{job?.client?.name}</strong> and <strong>{job?.assignedFreelancer?.name}</strong> for 
                  the project titled <strong>{job?.title}</strong>. The freelancer agrees to deliver the required work by <strong>{formatDate(job?.completedBy)}</strong> in 
                  exchange for the agreed-upon budget of <strong>₹{job?.budget}</strong>.
                </p>
              </div>

              {/* Show accept/decline buttons only if the contract is not yet accepted or declined */}
              {user?.role === 'freelancer' && contractStatus !== 'active' && contractStatus !== 'cancelled' && (
                <div className="d-flex gap-2 mt-3">
                  <Button variant="success" onClick={handleAcceptContract}>Accept Contract</Button>
                  <Button variant="outline-danger" onClick={handleDeclineContract}>Decline</Button>
                </div>
              )}
              {contractStatus === 'active' && (
                <div className="mt-3">
                  <Badge bg="success" className="p-2 fs-6">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Contract Accepted
                  </Badge>
                </div>
              )}
              {contractStatus === 'cancelled' && (
                <div className="mt-3">
                  <Badge bg="danger" className="p-2 fs-6">
                    <i className="bi bi-x-circle-fill me-2"></i>
                    Contract Declined
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Milestones & Payments */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-flag me-2"></i>Milestones & Payments</h2>
            </Card.Header>
            <Card.Body>
              {job.milestones.length > 0 ? (
                <ListGroup variant="flush">
                  {job.milestones.map((milestone, idx) => {
                    const isPaid = getPaidMilestoneLabels.includes(milestone);
                    const contractMilestone = contract?.milestonePayments?.find(m => m.label === milestone);
                    const isCompleted = contractMilestone?.completedByFreelancer;
                    
                    return (
                      <ListGroup.Item 
                        key={idx}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="primary" pill>{idx + 1}</Badge>
                          <span className="fs-6">{milestone}</span>
                          {isPaid && <Badge bg="success" pill>Paid</Badge>}
                          {!isPaid && isCompleted && 
                            <Badge bg="warning" text="dark" pill>Ready for Payment</Badge>}
                        </div>
                        
                        <div className="d-flex gap-2">
                          {isClient && !isPaid && (
                            <Button
                              variant={isCompleted ? "outline-success" : "outline-secondary"}
                              size="sm"
                              onClick={() => handleMilestonePayment(contractMilestone?.label, idx)}
                              disabled={!isCompleted || contractStatus !== 'active'} 
                            >
                              {isCompleted 
                                ? <><i className="bi bi-credit-card me-1"></i> Release ₹{contract?.milestonePayments?.[idx]?.amount}</>
                                : <><i className="bi bi-hourglass-split me-1"></i> Awaiting Completion</>} 
                            </Button>
                          )}
                          
                          {isClient && isPaid && (
                            <Button variant="success" size="sm" disabled>
                              <i className="bi bi-check-circle me-1"></i> Payment Released
                            </Button>
                          )}
                          
                          {isFreelancer && !isPaid && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowMarkDoneModal(true);
                              }}
                              disabled={isCompleted || completedMilestones.includes(milestone) || contractStatus !== 'active'}
                            >
                              <i className="bi bi-check2-all me-1"></i> Mark as Done
                            </Button>
                          )}
                          
                          {isFreelancer && isPaid && (
                            <Button variant="success" size="sm" disabled>
                              <i className="bi bi-check-circle me-1"></i> Completed & Paid
                            </Button>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <Alert variant="info">No milestones defined for this project.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col md={4}>
          {/* Files Section */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h2 className="h4 mb-0"><i className="bi bi-folder me-2"></i>Files</h2>
            </Card.Header>
            <Card.Body>
              {job.files?.length > 0 ? (
                <ListGroup variant="flush">
                  {job.files.map((f) => (
                    <ListGroup.Item key={f._id} className="d-flex justify-content-between align-items-center px-0 py-2">
                      <div>
                        <i className="bi bi-file-earmark me-2"></i>
                        <a href={`/uploads/${f.filename}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {f.originalname}
                        </a>
                        <small className="d-block text-muted mt-1">
                          Uploaded: {new Date(f.uploadedAt).toLocaleString()}
                        </small>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        <i className="bi bi-download"></i>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
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
            </Card.Body>
          </Card>

          {/* Project Timeline */}
          <Card className="shadow-sm mb-4 bg-light">
            <Card.Body>
              <h5 className="card-title mb-3">
                <i className="bi bi-calendar3 me-2"></i>Project Timeline
              </h5>
              <div className="d-flex justify-content-between text-muted mb-1">
                <small>Start</small>
                <small>Progress: {contractProgress}%</small>
                <small>Deadline</small>
              </div>
              <ProgressBar 
                variant={contractProgress < 30 ? "danger" : 
                        contractProgress < 70 ? "warning" : "success"} 
                now={contractProgress} 
                className="mb-3" 
                style={{ height: "20px" }}
                label={`${contractProgress}%`}
              />
              <div className="d-flex justify-content-between">
                <small>{new Date(job.createdAt).toLocaleDateString()}</small>
                <small>{formatDate(job.completedBy)}</small>
              </div>
            </Card.Body>
          </Card>

          {/* Add Reviews Card when job is closed */}
          {job?.status === 'closed' && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h2 className="h4 mb-0"><i className="bi bi-star me-2"></i>Reviews</h2>
              </Card.Header>
              <Card.Body>
                {userReviews.length > 0 ? (
                  <div className="mb-3">
                    <h5>Project Reviews</h5>
                    {userReviews.map(review => (
                      <div key={review._id} className="border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="fw-bold">{review.reviewerName}</span>
                            <div className="text-warning">
                              {Array(5).fill().map((_, i) => (
                                <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                              ))}
                            </div>
                          </div>
                          <Badge bg="light" text="dark">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-muted mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="light">No reviews yet for this project.</Alert>
                )}
                
                {/* Review Form */}
                {canReview && job.status === 'closed' && (
                  <div>
                    {!showReviewForm ? (
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={() => setShowReviewForm(true)}
                      >
                        <i className="bi bi-star me-1"></i> Leave a Review
                      </Button>
                    ) : (
                      <div className="mt-3">
                        <h5>Leave Your Review</h5>
                        <ReviewForm 
                          jobId={jobId} 
                          setUserReviews={setUserReviews} 
                          setCanReview={setCanReview} 
                        />
                        <Button 
                          variant="link" 
                          className="text-muted mt-2"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Close Job Button */}
          {isClient && allMilestonesPaid && (
            job?.status !== 'closed' ? (
              <Button 
                variant="danger" 
                className="w-100"
                onClick={handleCloseJob}
              >
                <i className="bi bi-lock-fill me-2"></i>Close Job
              </Button>
            ) : (
              <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                This job has been successfully closed.
              </Alert>
            )
          )}
        </Col>
      </Row>

      {/* Messages */}
      <Card className="shadow-sm mt-4">
        <Card.Header className="bg-light">
          <h2 className="h4 mb-0"><i className="bi bi-chat-dots me-2"></i>Messages</h2>
        </Card.Header>
        <Card.Body>
          <JobChat jobId={jobId} user={user}/>
        </Card.Body>
      </Card>
      
      {/* Mark as Done Modal - Using React Bootstrap Modal */}
      <Modal 
        show={showMarkDoneModal} 
        onHide={() => setShowMarkDoneModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Milestone Completion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark "<strong>{selectedMilestone}</strong>" as done?
          <Alert variant="info" className="mt-3">
            <i className="bi bi-info-circle me-2"></i>
            Once marked as complete, the client will be notified to release payment for this milestone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMarkDoneModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleConfirmMarkDone}>
            <i className="bi bi-check2-all me-1"></i> Yes, Mark as Done
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobArea;