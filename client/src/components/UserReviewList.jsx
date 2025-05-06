// UserReviewList.js
import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { getReviewsForUser } from '../services/apiRoutes';

function UserReviewList({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await getReviewsForUser(userId);
        setReviews(response.data); // Assuming the API response structure has 'data' as an array of reviews
      } catch {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reviews.length === 0) {
    return <Alert variant="info">This user has no reviews yet.</Alert>;
  }

  return (
    <div>
      <h4>User Reviews</h4>
      {reviews.map((review) => (
        <Card key={review._id} className="mb-3">
          <Card.Body>
            <Card.Title>{review.reviewer?.name || 'Anonymous'}</Card.Title>
            <Card.Text>{review.comment}</Card.Text>
            <Card.Subtitle className="mb-2 text-muted">Rating: {review.rating}/5</Card.Subtitle>
            <Badge bg="secondary">{review.contract?.title || 'No contract title'}</Badge>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default UserReviewList;
