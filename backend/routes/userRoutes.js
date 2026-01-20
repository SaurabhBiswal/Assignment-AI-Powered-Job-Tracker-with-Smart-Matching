import express from 'express';

import { applyForJob, getUserData, getUserJobApplications, updateUserProfile } from "../controller/userController.js";
import upload from '../config/multer.js';

const router = express.Router();

router.get('/user', getUserData);


router.post('/apply', applyForJob);


import { updateUserApplicationStatus } from "../controller/userController.js";
router.post('/update-status', updateUserApplicationStatus);


router.get('/applications', getUserJobApplications);


router.post('/update-profile', upload.single('resume'), updateUserProfile);

import { matchJobWithAI } from "../controller/userController.js";
router.post('/match-job', matchJobWithAI);

export default router;