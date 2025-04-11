import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Placeholder user dashboard (generic) */}
          <Route path="/userdashboard" element={<UserDashboard />} />

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
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
