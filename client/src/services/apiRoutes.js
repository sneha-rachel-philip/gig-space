import axiosInstance from './axiosInstance';

// Auth routes
export const registerUser = (userData) => axiosInstance.post('/auth/register', userData);
export const loginUser = (userData) => axiosInstance.post('/auth/login', userData);

// Admin routes
export const getAllUsers = () => axiosInstance.get('/admin/users');
export const deleteUser = (userId) => axiosInstance.delete(`/admin/users/${userId}`);
export const updateUserStatus = (userId, status) => axiosInstance.put(`/admin/users/${userId}/status`, { status }); 
export const getAdminDashboardStats = () =>axiosInstance.get('/admin/dashboard/stats');


export const unflagJob = (jobId) => axiosInstance.put(`/admin/jobs/${jobId}/unflag`);
export const getFlaggedJobs = () => axiosInstance.get('/admin/jobs/flagged');
export const deleteJobByAdmin = (jobId) => axiosInstance.delete(`admin/jobs/${jobId}`);
export const getAllJobsForAdmin = (params) => axiosInstance.get('/admin/jobs', { params });
// Admin review moderation routes
export const getPendingReviews = () => axiosInstance.get('/admin/reviews/pending');
export const approveReview = (reviewId) => axiosInstance.post(`/admin/reviews/${reviewId}/approve`);
export const deleteReview = (reviewId) => axiosInstance.delete(`/admin/reviews/${reviewId}`);
export const flagReview = (reviewId, note) => axiosInstance.post(`/admin/reviews/${reviewId}/flag`, { note });




// Client routes 
export const postJob = (jobData) => axiosInstance.post('/client/jobs', jobData);
export const getJobsByClient = () => axiosInstance.get('/client/jobs');
export const updateJobStatus = (jobId, data) =>axiosInstance.put(`/client/jobs/${jobId}/status`, data);
export const updateJob = (jobId, updatedData) => axiosInstance.put(`/client/jobs/${jobId}`, updatedData);


// Freelancer routes
export const getJobsByFreelancer = () => axiosInstance.get('/freelancer/jobs');

// Job routes
//export const getJobs = () => axiosInstance.get('/jobs');
// apiRoutes.js
export const getJobsByCategory = (filters) => axiosInstance.get('/jobs/category', { params: filters });
export const getJobs = (params) => axiosInstance.get('/jobs', { params });
export const getJobById = (jobId) => axiosInstance.get(`/jobs/${jobId}`);
export const applyForJob = (jobId) => axiosInstance.post(`/jobs/${jobId}/apply`);
export const closeJob = (jobId) => axiosInstance.put(`/jobs/${jobId}/status`, { status: 'closed' });
export const flagJob = (jobId, reason) =>axiosInstance.post(`/jobs/${jobId}/flag`, { reason });
export const deleteJob = (jobId) => axiosInstance.delete(`/jobs/${jobId}`);
  
// File upload
export const uploadJobFile = (jobId, formData) => axiosInstance.post(`/jobs/${jobId}/upload`, formData, {headers: { 'Content-Type': 'multipart/form-data' }, });

  
// Contract routes
export const createContract = (data) => axiosInstance.post('/contract/create', data);
/* export const getContractsForFreelancer = () => axiosInstance.get('/contract/freelancer');
export const getContractsForClient = () => axiosInstance.get('/contract/client'); */
export const getContractByJobId = (jobId) => axiosInstance.get(`/contract/by-job/${jobId}`);
export const updateContractStatus = (contractId, status) => axiosInstance.put(`/contract/update`, { contractId, status });
export const markMilestoneAsDone = (contractId, label) => axiosInstance.post(`/contract/${contractId}/milestone/mark-done`, { label });
export const getGroupedMilestoneApprovals = () =>axiosInstance.get('/contract/pending-approvals');
  export const approveMilestone = (contractId, milestoneLabel) => axiosInstance.patch(`/contract/${contractId}/milestones/${milestoneLabel}/approve`);

// Message routes
export const sendMessage = (data) => axiosInstance.post('/messages/send', data);
export const getConversation = (userId) => axiosInstance.get(`/message/conversations/${userId}`);
export const getUserChats = () => axiosInstance.get('/messages/chats');
export const getJobMessages = (jobId) =>axiosInstance.get(`/messages/${jobId}`);

// Payment routes
export const createPayment = (data) => axiosInstance.post('/payments', data);
export const getPaymentsForUser = () => axiosInstance.get('/payments');
export const createStripeCheckoutSession = (data) =>axiosInstance.post('/payments/create-checkout-session', data);
export const requestWithdrawal = (data) =>axiosInstance.post('/payments/withdraw', data);
  

// Proposal routes
export const submitProposal = (data) => axiosInstance.post('/proposal/submit', data);
export const getProposalsForJob = (jobId) => axiosInstance.get(`/proposal/job/${jobId}`);
export const acceptProposal = (proposalId) => axiosInstance.put(`/proposal/${proposalId}/accept`);
export const rejectProposal = (proposalId) => axiosInstance.put(`/proposal/${proposalId}/reject`);
export const getProposalsForFreelancer = () => axiosInstance.get('/proposal/freelancer');
export const getProposalById = (proposalId) => axiosInstance.get(`/proposal/id/${proposalId}`);


// Review routes
export const addReview = (data) => axiosInstance.post('/reviews', data);
export const getReviewsForUser = (userId) => axiosInstance.get(`/reviews/${userId}`);
export const getReviewsForJob = (jobId) => axiosInstance.get(`/reviews/job/${jobId}`);

// User routes
export const getCurrentUser = () => axiosInstance.get('/users/me');
export const getUserById = (userId) => axiosInstance.get(`/users/${userId}`);
export const updateUser = (data) => axiosInstance.put('/users/me', data);
export const getUsersByRole = (role) => axiosInstance.get(`/users/role/${role}`);
export const changePassword = (data) =>axiosInstance.put('/users/changePassword', data);
  
