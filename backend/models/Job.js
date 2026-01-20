import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    salary: { type: Number, required: true },
    date: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    jobType: { type: String, required: true, default: "Full-Time" },
    workMode: { type: String, required: true, default: "On-site" },
    skills: { type: [String], default: [] },
    externalUrl: { type: String, default: "" }, // For Smart Application Tracking
});

const Job = mongoose.model('Job', jobSchema)

export default Job 
