function ReviewList({ reviews }) {
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return (
      <div className="mt-3">
        {sortedReviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    );
  }

export default ReviewList;