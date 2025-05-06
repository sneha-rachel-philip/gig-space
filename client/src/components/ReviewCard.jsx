function ReviewCard({ review }) {
    const { rating, comment, reviewer, createdAt } = review;
    const date = new Date(createdAt).toLocaleDateString();
    
    return (
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  style={{ fontSize: '16px', color: star <= rating ? 'gold' : 'gray' }}
                >
                  ★
                </span>
              ))}
              <Badge bg="secondary" className="ms-2">{rating}/5</Badge>
            </div>
            <span className="text-muted small">{date}</span>
          </div>
          
          <Card.Title>{reviewer?.name || "User"}</Card.Title>
          
          {comment && (
            <Card.Text>{comment}</Card.Text>
          )}
        </Card.Body>
      </Card>
    );
  }

export default ReviewCard;