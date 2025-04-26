import axiosInstance from './axiosInstance';

// Auth routes
export const registerUser = (userData) => axiosInstance.post('/auth/register', userData);
export const loginUser = (userData) => axiosInstance.post('/auth/login', userData);

// Admin routes
export const getAllUsers = () => axiosInstance.get('/admin/users');
export const deleteUser = (userId) => axiosInstance.delete(`/admin/users/${userId}`);

// Client routes
export const postJob = (jobData) => axiosInstance.post('/client/jobs', jobData);
export const getJobsByClient = () => axiosInstance.get('/client/jobs');
export const updateJobStatus = (jobId, data) =>axiosInstance.put(`/client/jobs/${jobId}/status`, data);
export const updateJob = (jobId, updatedData) => axiosInstance.put(`/client/jobs/${jobId}`, updatedData);


// Job routes
//export const getJobs = () => axiosInstance.get('/jobs');
// apiRoutes.js
export const getJobsByCategory = (filters) => axiosInstance.get('/jobs/category', { params: filters });
  
export const getJobs = (params) => axiosInstance.get('/jobs', { params });
export const getJobById = (jobId) => axiosInstance.get(`/jobs/${jobId}`);
export const applyForJob = (jobId) => axiosInstance.post(`/jobs/${jobId}/apply`);
export const deleteJob = (jobId) => axiosInstance.delete(`/jobs/${jobId}`);
export const closeJob = (jobId) => axiosInstance.put(`/jobs/${jobId}/status`, { status: 'closed' });
// File upload
export const uploadJobFile = (jobId, formData) => axiosInstance.post(`/jobs/${jobId}/upload`, formData, {headers: { 'Content-Type': 'multipart/form-data' }, });

  
// Contract routes
export const createContract = (data) => axiosInstance.post('/contract/create', data);
export const getContractsForFreelancer = () => axiosInstance.get('/contract/freelancer');
export const getContractsForClient = () => axiosInstance.get('/contract/client');
export const updateContractStatus = (id, status) => axiosInstance.put('/contract/update', { contractId: id, status });

// Message routes
export const sendMessage = (data) => axiosInstance.post('/message/send', data);
export const getConversation = (userId) => axiosInstance.get(`/message/conversation/${userId}`);
export const getUserChats = () => axiosInstance.get('/message/chats');

// Payment routes
export const createPayment = (data) => axiosInstance.post('/payments', data);
export const getPaymentsForUser = () => axiosInstance.get('/payments');

// Proposal routes
export const submitProposal = (data) => axiosInstance.post('/proposal/submit', data);
export const getProposalsForJob = (jobId) => axiosInstance.get(`/proposal/${jobId}`);
export const acceptProposal = (proposalId) => axiosInstance.put(`/proposal/${proposalId}/accept`);
export const rejectProposal = (proposalId) => axiosInstance.put(`/proposal/${proposalId}/reject`);

// Review routes
export const addReview = (data) => axiosInstance.post('/reviews', data);
export const getReviewsForUser = (userId) => axiosInstance.get(`/reviews/${userId}`);

// User routes
export const getCurrentUser = () => axiosInstance.get('/users/me');
export const getUserById = (userId) => axiosInstance.get(`/users/${userId}`);
export const updateUser = (data) => axiosInstance.put('/users/me', data);
export const getUsersByRole = (role) => axiosInstance.get(`/users/role/${role}`);
