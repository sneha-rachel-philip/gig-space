import express from 'express';
import {
  getJobs,
  getJobById,
  uploadJobFile,
  flagJob,
  deleteJob
} from '../controllers/job.controller.js';

import { getJobsByCategory } from '../controllers/job.controller.js';


import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/upload.js';


const router = express.Router();



// GET /api/jobs - Get all jobs
router.get('/', getJobs);

router.get('/category', getJobsByCategory);


// GET /api/jobs/:id - Get job details by ID
router.get('/:id', getJobById);

router.post('/:id/flag', authenticate, flagJob);

router.post('/:id/upload', authenticate, upload.single('file'), uploadJobFile);

router.delete('/:id', authenticate, deleteJob);



// POST /api/jobs/:id/apply - Apply for a job (Only freelancer can apply)
/* router.post('/:id/apply', authenticate, authorizeRoles('freelancer'), applyForJob);
 */




// PUT /api/jobs/:id - Update job details (e.g., update job status, title, description)
// router.put('/:id/status', authenticate, updateJobStatus);  // Add this line to update job details

export default router;
