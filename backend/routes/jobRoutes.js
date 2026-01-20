import express from "express";
import { getJobById, getJobs, seedJobs } from "../controller/jobController.js";

const router = express.Router();
// Routes to get all jobs data
router.get('/', getJobs);

// Route to seed jobs
router.post('/seed', seedJobs);


//  Route to get a single job by ID
router.get('/:id', getJobById);

export default router;