import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../services/apiRoutes';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

// Import React Bootstrap components
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await loginUser({
        email,
        password,
      });
      
      const { token, ...user } = res.data;
      localStorage.setItem('token', token);
      toast.success('Login successful!');
      login(user);

      console.log('Login successful:', user);
      
      if (user && user.role === 'admin') {
        navigate('/admin/home');
      } else if (user && user.role === 'freelancer') {
        navigate('/freelancer/home');
      } else if (user && user.role === 'client') {
        navigate('/client/home');
      } else {
        navigate('/userdashboard');
        console.log("Defaulting to dashboard, current user:", user);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <Card className="shadow" style={{ maxWidth: '450px', width: '100%' }}>
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">
                <h2>Login</h2>
              </Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="w-100 mt-3"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p className="mb-1">
                  Forgot your password? <a href="#">Reset here</a>
                </p>
                <p>
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}

export default Login;