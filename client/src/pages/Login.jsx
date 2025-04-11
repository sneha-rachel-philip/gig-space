import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation
import { toast } from 'react-toastify'; // for toast notifications
import axios from '../services/axiosInstance'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true); // Optional: Set loading state if needed
      // Make API call to login
      const res = await axios.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save token to localStorage (or Context later)
      localStorage.setItem('token', token);

       // Show success toast
       toast.success('Login successful!');

      // Optionally, you can set user data in context or state management
      setUser(res.data)


      console.log('Login successful:', user);
       // Redirect to dashboard
       //navigate('/dashboard');
       navigate('/client/home'); // Redirect to client home page

    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.'); // Set error state
      toast.error('Login failed. Please check your credentials.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit"disabled={loading}>
           {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <p>
        Forgot your password? <a href="#">Reset here</a><br />
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
