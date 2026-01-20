import express from 'express';
// Yahan updateUserResume ko hata kar updateUserProfile kar diya hai
import { applyForJob, getUserData, getUserJobApplications, updateUserProfile } from "../controller/userController.js";
import upload from '../config/multer.js';

const router = express.Router();

// Get user data
router.get('/user', getUserData);

// Apply for a job
router.post('/apply', applyForJob);

// Update status (for external jobs)
import { updateUserApplicationStatus } from "../controller/userController.js";
router.post('/update-status', updateUserApplicationStatus);

// Get applied jobs
router.get('/applications', getUserJobApplications);

// Update user profile (ispe multer laga hai resume ke liye)
router.post('/update-profile', upload.single('resume'), updateUserProfile);

// AI Job Match
import { matchJobWithAI } from "../controller/userController.js";
router.post('/match-job', matchJobWithAI);

export default router;