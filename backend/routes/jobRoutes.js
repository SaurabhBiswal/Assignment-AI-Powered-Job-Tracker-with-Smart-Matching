import express from "express";
import { getJobById, getJobs, seedJobs } from "../controller/jobController.js";

const router = express.Router();

router.get('/', getJobs);

router.post('/seed', seedJobs);


router.get('/:id', getJobById);

export default router;