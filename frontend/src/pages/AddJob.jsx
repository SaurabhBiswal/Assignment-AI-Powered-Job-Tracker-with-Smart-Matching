import Quill from "quill";
import React, { useContext, useEffect, useRef, useState } from "react";
import { JobCategories, JobLocations, JobSkills } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const AddJob = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("Junior Level");
  const [salary, setSalary] = useState(0);

  // New Fields
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [skills, setSkills] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, companyToken } = useContext(AppContext);

  // Validate the form
  useEffect(() => {
    if (title.trim() && salary > 0 && jobType && workMode) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [title, salary, jobType, workMode]);

  const handleSkillChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get HTML content from Quill editor
      const description = quillRef.current ? quillRef.current.root.innerHTML : "";

      if (!description || description === "<p><br></p>") {
        toast.error("Job description is required");
        setIsSubmitting(false);
        return;
      }

      const postData = {
        title,
        description,
        location,
        category,
        level,
        salary,
        jobType,
        workMode,
        externalUrl,
        skills
      };

      const { data } = await axios.post(
        backendUrl + "/api/company/post-job",
        postData,
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message || "Job Posted Successfully!");
        // Reset form fields
        setTitle("");
        setSalary(0);
        setExternalUrl("");
        setSkills([]);
        if (quillRef.current) quillRef.current.root.innerHTML = "";
        setFormStep(1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Initiate Quill only Once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
          ]
        },
        placeholder: 'Create a detailed job description...'
      });
    }
  }, []);

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">Post a New Position</h2>
        <p className="text-gray-500 mt-1">Create a job listing to attract the perfect candidates</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Basic Info</span>
          <span className="text-sm font-medium text-gray-700">Job Details</span>
          <span className="text-sm font-medium text-gray-700">Preview & Post</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${(formStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="relative">
        {/* Step 1: Basic Info */}
        <motion.div
          className={`${formStep === 1 ? 'block' : 'hidden'}`}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">1</div>
              <h3 className="text-xl font-semibold text-gray-800">Basic Info & Type</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary (Annual) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 75000"
                  value={salary || ''}
                  onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="" disabled>Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="" disabled>Select Work Mode</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Apply Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">If provided, applicants will be redirected here.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setFormStep(2)}
              disabled={!title || salary <= 0 || !jobType || !workMode}
              className={`px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all ${(!title || salary <= 0 || !jobType || !workMode) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              Continue to Details
            </button>
          </div>
        </motion.div>

        {/* Step 2: Job Details */}
        <motion.div
          className={`${formStep === 2 ? 'block' : 'hidden'}`}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">2</div>
              <h3 className="text-xl font-semibold text-gray-800">Job Details & Skills</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <div
                  ref={editorRef}
                  className="w-full border border-gray-300 rounded-lg min-h-48"
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {JobCategories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {JobLocations.map((loc, index) => (
                      <option key={index} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Beginner level">Beginner level</option>
                    <option value="Intermediate level">Intermediate level</option>
                    <option value="Senior level">Senior level</option>
                  </select>
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                  {JobSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillChange(skill)}
                      className={`px-3 py-1 text-sm rounded-full border transition-all ${skills.includes(skill)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                        }`}
                    >
                      {skill} {skills.includes(skill) && "✓"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setFormStep(1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setFormStep(3)}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all"
            >
              Preview
            </button>
          </div>
        </motion.div>

        {/* Step 3: Preview & Submit */}
        <motion.div
          className={`${formStep === 3 ? 'block' : 'hidden'}`}
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Preview & Post</h3>
            <div className="p-6 border border-dashed border-gray-300 rounded-xl bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{title || "Job Title"}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">{jobType}</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">{workMode}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">${salary.toLocaleString()}</span>
                {externalUrl && <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">External Apply</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{s}</span>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 prose max-w-none">
                {quillRef.current && (
                  <div dangerouslySetInnerHTML={{ __html: quillRef.current.root.innerHTML }} />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setFormStep(2)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
            >
              Edit Details
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-all ${isSubmitting || !isFormValid ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default AddJob;