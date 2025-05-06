import Review from '../models/review.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

//Add a review for a completed contract
// Only the client or freelancer can leave a review for the other party
export const addReview = async (req, res) => {
  const { jobId, rating, comment } = req.body;
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Directly fetch the job with populated fields
    const job = await Job.findById(jobId)
      .populate('client', 'name email')
      .populate('assignedFreelancer', 'name email');

    if (!job || job.status !== 'closed') {
 
      return res.status(400).json({ error: 'You can only review completed jobs.' });
    }

    const reviewee = req.user._id.equals(job.client._id)
      ? job.assignedFreelancer._id
      : job.client._id;

    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      job: jobId,
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review for this contract.' });
    }

    const review = new Review({
      reviewer: req.user._id,
      reviewee,
      job: jobId,
      rating,
      comment,
    });

    await review.save();

    // Recalculate average rating
    const reviews = await Review.find({ reviewee });
    const average =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

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
        .populate('job', 'title');
      res.status(200).json(reviews);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching reviews' });
    }
  };

//Get all reviews for a specific job

export const getReviewsForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    // Validate jobId
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Find all reviews for the specific job
    const reviews = await Review.find({ job: jobId })
      .populate('reviewer', 'name username avatar')
      .populate('reviewee', 'name username avatar')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Return the reviews
    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching job reviews:', err);
    res.status(500).json({ error: 'Error fetching reviews for this job' });
  }
};

  