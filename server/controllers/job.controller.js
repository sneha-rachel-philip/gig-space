import Job from '../models/job.model.js';
import User from '../models/user.model.js';

// POST /api/jobs - Post a new job
export const postJob = async (req, res) => {
  const { title, description, budget, skillsRequired } = req.body;
  try {
    // Ensure the user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can post jobs.' });
    }

    const job = new Job({
      title,
      description,
      budget,
      skillsRequired,
      client: req.user._id,  // Set the client as the user who posts the job
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: 'Error posting job.' });
  }
};

// GET /api/jobs - Get all jobs
export const getJobs = async (req, res) => {
  try {
    // Filter by category if provided
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Handle pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch jobs with pagination and filtering
    const jobs = await Job.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('client', 'name email')
      .populate('freelancers', 'name email');

    const totalJobs = await Job.countDocuments(filter);  // Count all jobs with the filter applied

    res.json({
      jobs,
      total: totalJobs,
      page,
      pages: Math.ceil(totalJobs / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching jobs.' });
  }
};


// GET /api/jobs/:id - Get job details by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name email').populate('freelancers', 'name email');
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching job details.' });
  }
};

// PUT /api/jobs/:id/status - Update job status (open/closed)
export const updateJobStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to change the job status.' });
    }

    job.status = status;
    await job.save();
    const updatedJob = await Job.findById(job._id).populate('client', 'name email').populate('freelancers', 'name email');
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: 'Error updating job status.' });
  }
};

// PUT /api/jobs/:id - Update job details
export const updateJob = async (req, res) => {
  const { title, description, budget, skillsRequired, category } = req.body;

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Ensure that only the client who posted the job can update it
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this job.' });
    }

    // Update job fields
    job.title = title || job.title;
    job.description = description || job.description;
    job.budget = budget || job.budget;
    job.skillsRequired = skillsRequired || job.skillsRequired;
    job.category = category || job.category;

    await job.save();
    const updatedJob = await Job.findById(job._id).populate('client', 'name email').populate('freelancers', 'name email');

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: 'Error updating job details.' });
  }
};

// POST /api/jobs/:id/apply - Freelancer applies to a job
export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Ensure the user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can apply for jobs.' });
    }

    // Check if the freelancer has already applied
    if (job.freelancers.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    job.freelancers.push(req.user._id);
    await job.save();
    res.status(200).json({ message: 'Successfully applied for the job.' });
  } catch (err) {
    res.status(500).json({ error: 'Error applying for job.' });
  }
};

// GET /api/client/jobs - Get jobs created by the logged-in client
export const getJobsByClient = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .populate('freelancers', 'name email');

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error fetching client jobs:', err);
    res.status(500).json({ error: 'Error fetching client jobs.' });
  }
};

