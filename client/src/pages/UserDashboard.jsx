import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
//import { toast } from 'react-toastify'; // for toast notifications
const UserDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Redirect to login if the user is not logged in
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);
  
  return (
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>This is the user dashboard.</p>
    </div>
  );
};

export default UserDashboard;
