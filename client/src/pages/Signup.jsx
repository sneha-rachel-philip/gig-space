import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../services/apiRoutes';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('freelancer'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({ name, email, password, role });
      console.log('Signup response:', res.data);
      toast.success('Signup successful.');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || 'Signup failed.');
      toast.error(error.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="shadow" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Body className="p-4">
            <Card.Title className="text-center mb-4">
              <h2>Sign Up</h2>
            </Card.Title>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              
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
              
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                </Form.Select>
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="w-100 mt-3"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </Form>
            
            <div className="text-center mt-4">
              <p>
                Already have an account? <Link to="/">Login here</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Signup;