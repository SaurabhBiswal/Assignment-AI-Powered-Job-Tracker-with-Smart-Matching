import Job from "../models/Job.js";
import Company from "../models/Company.js";

// Get all jobs
export const getJobs = async (req, res) => {
    try {
        const { title, location, category, level, jobType, workMode, datePosted } = req.query;

        let query = { visible: true };

        if (title) {
            query.$or = [
                { title: { $regex: title, $options: "i" } },
                { description: { $regex: title, $options: "i" } },
                { category: { $regex: title, $options: "i" } },
                { skills: { $in: [new RegExp(title, "i")] } }
            ];
        }
        if (location) query.location = { $regex: location, $options: "i" };
        if (category) query.category = category;
        if (level) query.level = level;
        if (jobType) query.jobType = jobType;
        if (workMode) query.workMode = workMode;

        if (datePosted) {
            const now = Date.now();
            let days = 0;
            if (datePosted === '24h') days = 1;
            else if (datePosted === '7d') days = 7;
            else if (datePosted === '30d') days = 30;

            if (days > 0) {
                query.date = { $gte: now - (days * 24 * 60 * 60 * 1000) };
            }
        }

        const jobs = await Job.find(query)
            .populate({ path: "companyId", select: "-password" })
            .sort({ date: -1 });

        res.json({ success: true, jobs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
};


// Get a single job by ID
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params
        const job = await Job.findById(id)
            .populate({
                path: "companyId",
                select: "-password",

            })
        if (!job) {
            return res.json({
                success: false,
                message: "Job not found"
            })
        }

        res.json({
            success: true,
            job
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Internal function to fetch and save jobs (for Cron and Seed API)
export const internalFetchAndSaveMockJobs = async () => {
    // Find a company to attach jobs to (or create a dummy one if none exist)
    let company = await Company.findOne();
    if (!company) {
        throw new Error("No company found to attach mock jobs.");
    }

    const mockJobs = [
        {
            title: "Frontend Engineer (External) - Auto",
            description: "<p>We are looking for a React expert to join our global team.</p>",
            location: "New York (Remote)",
            category: "Programming",
            level: "Senior level",
            salary: 125000 + Math.floor(Math.random() * 10000),
            jobType: "Full-time",
            workMode: "Remote",
            skills: ["React", "TypeScript", "Redux"],
            externalUrl: "https://google.com/",
            companyId: company._id,
            date: Date.now()
        },
        {
            title: "Data Scientist (Adzuna) - Auto",
            description: "<p>Analyze large datasets and build predictive models.</p>",
            location: "London, UK",
            category: "Data Science",
            level: "Intermediate level",
            salary: 98000 + Math.floor(Math.random() * 5000),
            jobType: "Contract",
            workMode: "Hybrid",
            skills: ["Python", "Pandas", "Machine Learning"],
            externalUrl: "https://adzuna.com/",
            companyId: company._id,
            date: Date.now()
        },
        {
            title: "Product Designer - Auto",
            description: "<p>Design intuitive user experiences for our mobile apps.</p>",
            location: "California",
            category: "Design",
            level: "Beginner level",
            salary: 72000 + Math.floor(Math.random() * 5000),
            jobType: "Full-time",
            workMode: "On-site",
            skills: ["Figma", "UI/UX", "Prototyping"],
            externalUrl: "https://dribbble.com/jobs",
            companyId: company._id,
            date: Date.now()
        }
    ];

    await Job.insertMany(mockJobs);
    return `Seeded ${mockJobs.length} external jobs.`;
};

// Seed Mock External Jobs
export const seedJobs = async (req, res) => {
    try {
        const message = await internalFetchAndSaveMockJobs();
        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};