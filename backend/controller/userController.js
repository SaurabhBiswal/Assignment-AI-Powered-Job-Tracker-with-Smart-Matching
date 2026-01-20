import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { generateMatchScore } from "../utils/aiService.js";



export const getUserData = async (req, res) => {
  try {
    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    let user = await User.findById(userId);

    // If user not in DB, create (Auto-Registration)
    if (!user) {
      console.log("User not found in DB, creating new profile...");
      user = await User.create({
        _id: userId,
        name: "User_" + userId.slice(-4),
        email: `pending_${userId}@careercanvas.com`, // FIXED: Unique Email
        image: "https://via.placeholder.com/150",
        headline: "",
        portfolio: "",
        skills: [],
      });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.log("Error in getUserData:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// --- APPLY FOR A JOB ---
export const applyForJob = async (req, res) => {
  try {
    const { jobId, status } = req.body;
    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.json({ success: false, message: "You have already applied for this job" });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.json({ success: false, message: "Job not found" });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      status: status || "pending",
      date: Date.now(),
    });

    res.json({ success: true, message: "Applied Successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// --- UPDATE APPLICATION STATUS (For External Jobs) ---
export const updateUserApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const userId = typeof req.auth === "function" ? req.auth().userId : req.auth.userId;

    const application = await JobApplication.findOne({ _id: applicationId, userId });

    if (!application) {
      return res.json({ success: false, message: "Application not found or unauthorized" });
    }

    application.status = status;
    await application.save();

    res.json({ success: true, message: "Status Updated Successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// --- GET APPLIED APPLICATIONS ---
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location level salary")
      .exec();

    return res.json({ success: true, applications });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// --- UPDATE PROFESSIONAL PROFILE & RESUME ---
export const updateUserProfile = async (req, res) => {
  try {
    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;
    const { headline, portfolio, skills, phone, location } = req.body;
    const resumeFile = req.file;

    const userData = await User.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "User profile missing" });
    }

    // Resume handling via Cloudinary
    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
        resource_type: "raw",
      });
      userData.resume = resumeUpload.secure_url;

      // Extract Text from Resume
      try {
        const fileBuffer = fs.readFileSync(resumeFile.path);
        const data = await pdf(fileBuffer);
        userData.resumeText = data.text;
      } catch (err) {
        console.error("Resume parsing error:", err);
      }
    }

    // Professional fields update
    if (headline) userData.headline = headline;
    if (portfolio) userData.portfolio = portfolio;
    if (location) userData.location = location;
    if (phone) userData.phone = phone;

    // Skills handling (comma string to array)
    if (skills) {
      try {
        userData.skills = JSON.parse(skills);
      } catch (e) {
        userData.skills = skills.split(',').map(s => s.trim());
      }
    }

    await userData.save();

    return res.json({
      success: true,
      message: "Profile Updated Successfully",
      user: userData
    });

  } catch (error) {
    console.log("Error updating profile:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// --- AI JOB MATCHING ---
export const matchJobWithAI = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    const user = await User.findById(userId);
    if (!user || !user.resumeText) {
      return res.json({ success: false, message: 'Resume not found. Please upload a resume.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.json({ success: false, message: 'Job not found.' });
    }

    const matchResult = await generateMatchScore(user.resumeText, job.description);

    res.json({ success: true, match: matchResult });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
