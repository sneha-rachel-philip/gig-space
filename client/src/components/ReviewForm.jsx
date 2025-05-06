import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { addReview } from '../services/apiRoutes';

function ReviewForm({ jobId, setUserReviews, setCanReview }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setSubmitError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await addReview({ jobId, rating, comment });
      const data = response.data;

      // Update the UI with the new review
      setUserReviews(prevReviews => [...prevReviews, data.review]);
      setCanReview(false);
      setRating(0);
      setComment('');
      setSubmitting(false);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Error submitting review');
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="link"
              className="p-0 me-1"
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
            >
              <span style={{ fontSize: '24px', color: rating >= star ? 'gold' : 'gray' }}>
                ★
              </span>
            </Button>
          ))}
          {rating > 0 && (
            <span className="ms-2">{rating}/5</span>
          )}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Comment (Optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
        />
      </Form.Group>

      {submitError && (
        <Alert variant="danger">{submitError}</Alert>
      )}

      <Button
        variant="primary"
        type="submit"
        disabled={submitting || rating === 0}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </Form>
  );
}

export default ReviewForm;
