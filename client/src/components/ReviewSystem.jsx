import React, { useState, useEffect } from 'react';
import { Card, Container, Spinner, Alert } from 'react-bootstrap';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ReviewSummary from './ReviewSummary';

// Main component for both submitting and viewing reviews
export default function ReviewSystem({ jobId, revieweeId, currentUserId}) {
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canReview, setCanReview] = useState(false);
  
  useEffect(() => {
    // Fetch reviews for the user
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews/${revieweeId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch reviews');
        }
        
        setUserReviews(data);
        
        // Check if the current user has already reviewed this job
        if (jobId) {
          const hasReviewed = data.some(
            review => review.job === jobId && review.reviewer === currentUserId
          );
          setCanReview(!hasReviewed);
        }
        
        setLoading(false);
      } catch {
        setError('Failed to load reviews');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [revieweeId, jobId, currentUserId]);
  
  // Calculate average rating
  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((acc, review) => acc + review.rating, 0) / userReviews.length 
    : 0;
    
  return (
    <Container className="mt-4 mb-5">
      <div className="mb-4">
        <ReviewSummary 
          reviews={userReviews} 
          averageRating={averageRating} 
        />
      </div>
      
      {canReview && jobId && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Leave a Review</h4>
          </Card.Header>
          <Card.Body>
            <ReviewForm 
              jobId={jobId} 
              setUserReviews={setUserReviews} 
              setCanReview={setCanReview} 
            />
          </Card.Body>
        </Card>
      )}
      
      <div>
        <h4>Reviews ({userReviews.length})</h4>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : userReviews.length === 0 ? (
          <Alert variant="info">No reviews yet</Alert>
        ) : (
          <ReviewList reviews={userReviews} />
        )}
      </div>
    </Container>
  );
}

