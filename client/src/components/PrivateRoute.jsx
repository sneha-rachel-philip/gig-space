/* // src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  console.log("PrivateRoute user:", user);
  if (!user) return <Navigate to="/" />;

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // or a 403 page
  }

  return children;
};

export default PrivateRoute;
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  console.log("PrivateRoute check:", { currentUser, userRole, loading });
  
  // Don't redirect while still checking auth status
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  
  if (!currentUser) {
    console.log("Not authenticated, redirecting");
    return <Navigate to="/login" />;
  }

  // Check role - use userRole directly or currentUser.role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`User role ${userRole} not in allowed roles:`, allowedRoles);
    return <Navigate to="/userdashboard" />; // or a 403 page
  }

  return children;
};
export default PrivateRoute;
