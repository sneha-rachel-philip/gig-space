import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard'; // placeholder
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';

import { AuthProvider } from './context/AuthContext';

import PaymentSuccess from './pages/payment/PaymentSuccess';


// Client Dashboard
import ClientDashboardLayout from './pages/ClientDashboard/ClientDashboardLayout';
import ClientHome from './pages/ClientDashboard/ClientHome';
import ClientProjects from './pages/ClientDashboard/ClientProjects';
import ClientPayments from './pages/ClientDashboard/ClientPayments';
import ClientMessages from './pages/ClientDashboard/ClientMessages';
import ClientJobs from './pages/ClientDashboard/ClientJobs';

// Jobs
import JobDetails from './pages/Jobs/JobDetails';
import JobList from './pages/Jobs/JobList';
import PostJob from './pages/Jobs/PostJob';
import EditJob from './pages/Jobs/EditJob';
import JobCategory from './pages/Jobs/JobCategory';
import JobArea from './pages/Jobs/JobArea';


// Freelancer Dashboard
import FreelancerDashboardLayout from './pages/FreelancerDashboard/FreelancerDashboardLayout';
import FreelancerHome from './pages/FreelancerDashboard/FreelancerHome';
import FreelancerJobs from './pages/FreelancerDashboard/FreelancerJobs';
import FreelancerPayments from './pages/FreelancerDashboard/FreelancerPayments';
import FreelancerMessages from './pages/FreelancerDashboard/FreelancerMessages';

// Admin Dashboard
import AdminDashboardLayout from './pages/AdminDashboard/AdminDashboardLayout';
import JobManagement from './pages/AdminDashboard/JobManagement';
import UserManagement from './pages/AdminDashboard/UserManagement';
import ReviewModeration from './pages/AdminDashboard/ReviewModeration';
import PaymentTracking from './pages/AdminDashboard/PaymentTracking';
import AdminHome from './pages/AdminDashboard/AdminHome';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Placeholder user dashboard (generic) */}
          <Route path="/userdashboard" element={<UserDashboard />} />

           {/* Job Routes */}
          <Route path="/jobs/" element={<JobCategory />} />
          <Route path="/jobs/categories/" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/job-area/:jobId"
            element={
            <PrivateRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <JobArea />
            </PrivateRoute>
            } />

          <Route path="/payment-success" 
          element={
            <PrivateRoute allowedRoles={['client']}>
              <PaymentSuccess />
            </PrivateRoute>
            } />

 
            <Route
             path="/user/:userId/profile"
             element={
              <PrivateRoute allowedRoles={['client', 'freelancer', 'admin']}>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Client Dashboard (Protected if needed later) */}
          <Route
            path="/client"
            element={
              <PrivateRoute allowedRoles={['client']}>
                <ClientDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="home" element={<ClientHome />} />
            <Route path="projects" element={<ClientProjects />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="jobs" element={<ClientJobs />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="edit-job/:id" element={<EditJob />} />
            <Route path="profile" element={<ProfilePage />} />

          </Route>

          {/* Freelancer Dashboard (Protected if needed later) */}
          <Route
            path="/freelancer"
            element={
              <PrivateRoute allowedRoles={['freelancer']}>
                <FreelancerDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="home" element={<FreelancerHome />} />
            <Route path="payments" element={<FreelancerPayments />} />
            <Route path="jobs" element={<FreelancerJobs />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="messages" element={<FreelancerMessages />} />

      
          </Route>    

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="home" element={<AdminHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="reviews" element={<ReviewModeration />} />
            <Route path="payments" element={<PaymentTracking />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
