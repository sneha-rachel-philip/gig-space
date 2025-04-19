import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // for navigation
import { toast } from 'react-toastify'; // for toast notifications
import { loginUser } from '../services/apiRoutes';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';


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
      const res = await loginUser({
        email,
        password,
      });
      //console.log(res.data);
      const { token, ...user } = res.data;
      //console.log('User data:', user); // Debugging line
      // Save token to localStorage (or Context later)
      localStorage.setItem('token', token);

       // Show success toast
       toast.success('Login successful!');

      // Optionally, you can set user data in context or state management
      setUser(user)


      console.log('Login successful:', user);
       // Redirect to dashboard
       //navigate('/dashboard');
       if (user.role === 'admin') {
        navigate('/admin/home'); // Redirect to admin home page 
      } else if (user.role === 'freelancer') {
        navigate('/freelancer/home'); // Redirect to freelancer home page
      } else if (user.role === 'client') {    
       navigate('/client/home'); // Redirect to client home page
      }
      else {
        navigate('/userdashboard'); // Redirect to user dashboard (generic)
      }

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
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
  
        <p>
          Forgot your password? <a href="#">Reset here</a><br />
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
  
}
export default Login;
