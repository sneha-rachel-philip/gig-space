import Review from '../models/review.model.js';
import Contract from '../models/contract.model.js';
import User from '../models/user.model.js';

//Add a review for a completed contract
// Only the client or freelancer can leave a review for the other party
export const addReview = async (req, res) => {
  const { contractId, rating, comment } = req.body;

  try {
    const contract = await Contract.findById(contractId).populate('freelancer client');

    if (!contract || contract.status !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed contracts.' });
    }

    const reviewee = req.user._id.equals(contract.client._id)
      ? contract.freelancer._id
      : contract.client._id;

    const existingReview = await Review.findOne({ reviewer: req.user._id, contract: contractId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review for this contract.' });
    }

    const review = new Review({
      reviewer: req.user._id,
      reviewee,
      contract: contractId,
      rating,
      comment,
    });

    await review.save();

    // Update the average rating for the reviewee
    const reviews = await Review.find({ reviewee });
    const average = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(reviewee, { averageRating: average });


    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('Review Error:', err.message);
    console.error('Full error:', err); 
    res.status(500).json({ error: 'Error submitting review' });
  }
};

// Get all reviews for a user
export const getReviewsForUser = async (req, res) => {
    try {
      const reviews = await Review.find({ reviewee: req.params.userId })
        .populate('reviewer', 'name')
        .populate('contract', 'title');
  
      res.status(200).json(reviews);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching reviews' });
    }
  };
  