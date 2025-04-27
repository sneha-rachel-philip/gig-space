import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard'; // placeholder

import { AuthProvider } from './context/AuthContext';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
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
          <Route
            path="/job-area/:jobId"
            element={
              <PrivateRoute allowedRoles={['client', 'freelancer']}>
                <JobArea />
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
            {/* <Route path="projects" element={<FreelancerProjects />} />
            <Route path="payments" element={<FreelancerPayments />} />
            <Route path="messages" element={<FreelancerMessages />} />
            <Route path="jobs" element={<ClientJobs />} />
            <Route path="jobs/:id" element={<JobDetails />} /> */
            <Route path="jobs" element={<FreelancerJobs />} />
}
          </Route>    

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
