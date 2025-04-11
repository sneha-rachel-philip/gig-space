// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // or a 403 page
  }

  return children;
};

export default PrivateRoute;
