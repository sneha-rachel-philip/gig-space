// client/src/pages/AdminDashboard/ReviewModeration.jsx

import React, { useEffect, useState } from 'react';
import {
  getPendingReviews,
  approveReview,
  deleteReview,
  flagReview,
} from '../../services/apiRoutes';
import { Table, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [flagNote, setFlagNote] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getPendingReviews();
      setReviews(res.data);
    } catch  {
      setError('Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    await approveReview(id);
    fetchReviews();
  };

  const handleDelete = async (id) => {
    await deleteReview(id);
    fetchReviews();
  };

  const handleFlag = async () => {
    if (selectedReview) {
      await flagReview(selectedReview._id, flagNote);
      setShowFlagModal(false);
      setFlagNote('');
      fetchReviews();
    }
  };

  const openFlagModal = (review) => {
    setSelectedReview(review);
    setShowFlagModal(true);
  };

  if (loading) return <Spinner animation="border" />;

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3>Pending Review Moderation</h3>

      {reviews.length === 0 ? (
        <p>No pending reviews</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Reviewee</th>
              <th>Job</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.reviewer?.name}</td>
                <td>{review.reviewee?.name}</td>
                <td>{review.job?.title}</td>
                <td>{'⭐'.repeat(review.rating)}</td>
                <td>{review.comment}</td>
                <td>
                  <Button variant="success" size="sm" onClick={() => handleApprove(review._id)}>
                    Approve
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(review._id)}>
                    Delete
                  </Button>{' '}
                  <Button variant="warning" size="sm" onClick={() => openFlagModal(review)}>
                    Flag
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Flag Modal */}
      <Modal show={showFlagModal} onHide={() => setShowFlagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Flag Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason / Admin Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              placeholder="Enter reason for flagging this review"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFlagModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleFlag}>
            Flag Review
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewModeration;
