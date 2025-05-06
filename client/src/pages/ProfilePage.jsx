import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, Card, Button, Form, Badge, Row, Col, Spinner } from 'react-bootstrap';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, getUserById, updateUser, getReviewsForUser } from '../services/apiRoutes';
import UserReviewList from '../components/UserReviewList';

function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const isOwnProfile = !userId || (user && profile && user._id === profile._id);

  const getRatingBadgeColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'primary';
    if (rating >= 2.5) return 'warning';
    return 'danger';
  };

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      setIsLoading(true);
      try {
        const res = userId ? await getUserById(userId) : await getCurrentUser();
        const profileData = res.data?.user || res.data;
        setProfile(profileData);
        setFormData(profileData);

        const fetchId = userId || profileData._id;
        if (fetchId) {
          try {
            const reviewsRes = await getReviewsForUser(fetchId);
            setReviews(reviewsRes.data);
            console.log(reviewsRes.data);  // Check the response data structure

          } catch (err) {
            console.error('Error fetching reviews', err);
          }
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndReviews();
  }, [userId, user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'freelanceAppUploads');

    try {
      const uploadRes = await axios.post('https://api.cloudinary.com/v1_1/dnrrdgkfn/image/upload', uploadData);
      const imageUrl = uploadRes.data.secure_url;

      const updateRes = await updateUser({ profileImage: imageUrl });
      setProfile(updateRes.data);
      setFormData(prev => ({ ...prev, profileImage: imageUrl }));
    } catch (err) {
      console.error('Error uploading image', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUser(formData);
      setProfile(res.data);
      setFormData(res.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile', err);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Row>
        <Col md={4} className="mb-4 text-center">
          <img
            src={profile.profileImage || '/default-profile.png'}
            alt="Profile"
            className="rounded-circle mb-3"
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
          {isOwnProfile && (
            <div className="mb-3">
              <input
                type="file"
                onChange={handleImageUpload}
                className="form-control"
                style={{ maxWidth: '300px', margin: '0 auto' }}
              />
            </div>
          )}
          <h2>{profile.name}</h2>
          <p className="text-muted">{profile.role}</p>

          {isOwnProfile && (
            <div className="mt-4 mb-4">
              <Button variant="outline-primary" className="me-2" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
              <Button variant="outline-secondary" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          )}
        </Col>

        <Col md={8}>
          {editMode ? (
            <Form onSubmit={handleSubmit}>
              <Accordion defaultActiveKey="0" className="mb-4">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Basic Information</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>

                {profile.role === 'freelancer' && (
                  <>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Skills & Experience</Accordion.Header>
                      <Accordion.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Skills (comma-separated)</Form.Label>
                          <Form.Control
                            type="text"
                            name="skills"
                            value={formData.skills ? formData.skills.join(', ') : ''}
                            onChange={handleSkillsChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Experience</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="experience"
                            value={formData.experience || ''}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Hourly Rate ($)</Form.Label>
                          <Form.Control
                            type="number"
                            name="hourlyRate"
                            value={formData.hourlyRate || 0}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Portfolio</Accordion.Header>
                      <Accordion.Body>
                        <p className="text-muted">Portfolio editing functionality can be added here</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  </>
                )}

                {profile.role === 'client' && (
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Company Information</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={formData.company || ''}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>
                )}
              </Accordion>
              <Button type="submit" variant="primary">Save Changes</Button>
            </Form>
          ) : (
            <Accordion defaultActiveKey="0" className="mb-4">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Basic Information</Accordion.Header>
                <Accordion.Body>
                  <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
                  <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                </Accordion.Body>
              </Accordion.Item>

              {profile.role === 'freelancer' && (
                <>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Skills & Experience</Accordion.Header>
                    <Accordion.Body>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="mb-3">
                          <h6>Skills:</h6>
                          <div>
                            {profile.skills.map((skill, idx) => (
                              <Badge key={idx} bg="primary" className="me-1 mb-1">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>No skills listed yet</p>
                      )}
                      
                      <div className="mb-3">
                        <h6>Experience:</h6>
                        <p>{profile.experience || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h6>Hourly Rate:</h6>
                        <p>{profile.hourlyRate > 0 ? `$${profile.hourlyRate}/hr` : 'Not specified'}</p>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Portfolio</Accordion.Header>
                    <Accordion.Body>
                      {profile.portfolio && profile.portfolio.length > 0 ? (
                        <div className="row">
                          {profile.portfolio.map((item, idx) => (
                            <div key={idx} className="col-md-6 mb-3">
                              <Card>
                                <Card.Body>
                                  <Card.Title>{item.title}</Card.Title>
                                  <Card.Text>{item.description}</Card.Text>
                                  {item.link && (
                                    <Button variant="link" href={item.link} target="_blank">
                                      View Project
                                    </Button>
                                  )}
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No portfolio items added yet</p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </>
              )}

              {profile.role === 'client' && (
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Company Information</Accordion.Header>
                  <Accordion.Body>
                    <p><strong>Company:</strong> {profile.company || 'Not specified'}</p>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              <Accordion.Item eventKey="3">
                <Accordion.Header>Reviews & Ratings</Accordion.Header>
                <Accordion.Body>
                  <div className="mb-3">
                    <h6>Average Rating:</h6>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        {profile.averageRating > 0 ? (
                          <Badge bg="success">{profile.averageRating.toFixed(1)}/5</Badge>
                        ) : (
                          <Badge bg="secondary">No ratings yet</Badge>
                        )}
                      </div>
                      <small className="text-muted">({reviews.length} reviews)</small>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <Card key={idx} className="mb-2">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">
                                {review.reviewer?.name || 'Anonymous'}
                              </h6>
                              <small className="text-muted">
                                Project: {review.job?.title || 'Not specified'}
                              </small>
                            </div>
                            <Badge bg={getRatingBadgeColor(review.rating)}>
                              {review.rating}/5
                            </Badge>
                          </div>
                          <p className="mb-0">{review.comment || 'No comment provided'}</p>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <p>No reviews yet</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
        </Col>
      </Row>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

export default ProfilePage;