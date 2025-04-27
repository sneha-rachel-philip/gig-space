import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, updateJob } from '../../services/apiRoutes';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Layout from '../../components/Layout';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skillsRequired: '',
    category: '',
    acceptedTill: '',
    completedBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getJobById(id);
        const { title, description, budget, skillsRequired, category, acceptedTill, completedBy } = res.data;
        
        // Format dates for form inputs
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        };
        
        setFormData({
          title,
          description,
          budget,
          skillsRequired: skillsRequired.join(', '),
          category: category || '',
          acceptedTill: acceptedTill ? formatDateForInput(acceptedTill) : '',
          completedBy: completedBy ? formatDateForInput(completedBy) : ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Could not load job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedJob = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()),
      };
      await updateJob(id, updatedJob);
      setSuccess(true);
      setLoading(false);
      
      // Navigate back after showing success message
      setTimeout(() => {
        navigate('/client/jobs');
      }, 1500);
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again.');
      setLoading(false);
    }
  };

  // Job categories for dropdown
  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Entry',
    'Virtual Assistant',
    'Customer Service',
    'Other'
  ];

  if (loading && !formData.title) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading job details...</p>
      </Container>
    );
  }

  return (
    <Layout>
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h2 className="h4 mb-0">Edit Job</h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success">
                  Job updated successfully! Redirecting...
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Provide detailed information about the job"
                    required
                  />
                  <Form.Text className="text-muted">
                    Be specific about deliverables, requirements, and expectations.
                  </Form.Text>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Budget (USD)</Form.Label>
                      <Form.Control
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Enter your budget"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Skills Required (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                    required
                  />
                  <Form.Text className="text-muted">
                    List all skills needed to complete this job successfully.
                  </Form.Text>
                </Form.Group>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Application Deadline</Form.Label>
                      <Form.Control
                        type="date"
                        name="acceptedTill"
                        value={formData.acceptedTill}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Project Completion Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="completedBy"
                        value={formData.completedBy}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </Layout>
  );
};

export default EditJob;