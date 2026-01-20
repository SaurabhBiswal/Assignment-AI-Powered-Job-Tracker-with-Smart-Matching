import React, { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations, JobSkills } from "../assets/assets";
import JobCard from "./JobCard";
import { motion, AnimatePresence } from "framer-motion";

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

  const initialLoad = useRef(true);
  const [showFilter, setShowFilter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [filterJobs, setFilterJobs] = useState(jobs);
  const [fade, setFade] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedDatePosted, setSelectedDatePosted] = useState('');
  const [selectedMatchScore, setSelectedMatchScore] = useState('');
  const [sortBy, setSortBy] = useState('recent');

 
  const prevSelectedCategory = useRef(selectedCategory);
  const prevSelectedLocation = useRef(selectedLocation);
  const prevSearchFilter = useRef({ ...searchFilter });

  const calculateMatchScore = (job) => {
    return job.matchScore || Math.floor(Math.random() * 40) + 60; // Mock 60-100%
  };

  const triggerTransition = (callback, shouldScroll = true) => {
    setFade(false);
    setTimeout(() => {
      callback();
      setFade(true);
      if (shouldScroll && !initialLoad.current) {
        document.getElementById("job-list")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 300);
  };

  useEffect(() => {
    const filterJobs = () => {
      const matchesCategory = (job) =>
        selectedCategory.length === 0 ||
        selectedCategory.includes(job.category) ||
        (selectedCategory.includes("Software Engineer") && job.category === "Programming");

      const matchesLocation = (job) =>
        selectedLocation.length === 0 || selectedLocation.includes(job.location);

      const matchesTitle = (job) =>
        searchFilter.title === "" ||
        job.title.toLowerCase().includes(searchFilter.title.toLowerCase());

      const matchesSearchLocation = (job) =>
        searchFilter.location === "" ||
        job.location.toLowerCase().includes(searchFilter.location.toLowerCase());

      const matchesJobType = (job) =>
        searchFilter.jobType === "" || job.jobType === searchFilter.jobType;

      const matchesWorkMode = (job) =>
        searchFilter.workMode === "" || job.workMode === searchFilter.workMode;

      const matchesSkills = (job) =>
        selectedSkills.length === 0 || (job.skills && selectedSkills.every(skill => job.skills.includes(skill)));

      const matchesDate = (job) => {
        if (!selectedDatePosted) return true;
        const now = Date.now();
        const jobDate = Number(job.date);
        const diffHours = (now - jobDate) / (1000 * 60 * 60);

        if (selectedDatePosted === '24h') return diffHours <= 24;
        if (selectedDatePosted === '7d') return diffHours <= 24 * 7;
        if (selectedDatePosted === '30d') return diffHours <= 24 * 30;
        return true;
      };

      const newFilteredJobs = jobs
        .slice()
        .reverse()
        .filter(
          (job) =>
            matchesCategory(job) &&
            matchesLocation(job) &&
            matchesTitle(job) &&
            matchesSearchLocation(job) &&
            matchesJobType(job) &&
            matchesWorkMode(job) &&
            matchesSkills(job) &&
            matchesDate(job)
        )
        .map(job => ({ ...job, matchScore: calculateMatchScore(job) }))
        .filter(job => {
          
          if (selectedMatchScore === 'high') return job.matchScore >= 70;
          if (selectedMatchScore === 'medium') return job.matchScore >= 40 && job.matchScore < 70;
          return true;
        })
        .sort((a, b) => {
          
          if (sortBy === 'salary') return (b.salary || 0) - (a.salary || 0);
          if (sortBy === 'match') return b.matchScore - a.matchScore;
          return 0; 
        });

      setFilterJobs(newFilteredJobs);
      setCurrentPage(1);
    };

  
    const filtersChanged =
      prevSelectedCategory.current !== selectedCategory ||
      prevSelectedLocation.current !== selectedLocation ||
      JSON.stringify(prevSearchFilter.current) !== JSON.stringify(searchFilter);

    if (initialLoad.current) {
      filterJobs();
      initialLoad.current = false;
    } else {
      triggerTransition(filterJobs, filtersChanged);
    }

    prevSelectedCategory.current = selectedCategory;
    prevSelectedLocation.current = selectedLocation;
    prevSearchFilter.current = { ...searchFilter };
  }, [jobs, selectedCategory, selectedLocation, searchFilter, sortBy, selectedMatchScore, selectedSkills, selectedDatePosted]);

  const handleCategoryChange = (category) => {
    triggerTransition(() => {
      setSelectedCategory((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    });
  };

  const handleLocationChange = (location) => {
    triggerTransition(() => {
      setSelectedLocation((prev) =>
        prev.includes(location)
          ? prev.filter((c) => c !== location)
          : [...prev, location]
      );
    });
  };

  const handleSkillChange = (skill) => {
    triggerTransition(() => {
      setSelectedSkills((prev) =>
        prev.includes(skill)
          ? prev.filter((s) => s !== skill)
          : [...prev, skill]
      );
    });
  };

  const handlePageChange = (newPage) => {
    triggerTransition(() => setCurrentPage(newPage));
  };

  const clearAllFilters = () => {
    triggerTransition(() => {
      setSelectedCategory([]);
      setSelectedLocation([]);
      setSelectedSkills([]);
      setSearchFilter({ title: "", location: "", jobType: "", workMode: "" });
      setSelectedDatePosted('');
      setSelectedMatchScore('');
    });
  };

  return (
    <div className="container mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8 px-4 lg:px-8">
      {/* FILTER SIDEBAR */}
      <motion.div
        className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg lg:hidden w-full justify-center mb-4"
          >
            {showFilter ? (
              <>Hide Filters</>
            ) : (
              <>Show Filters</>
            )}
          </button>

          {showFilter && (
            <>
              {/* Current Search */}
              {isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg text-gray-800">Current Search</h3>
                    <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">Clear all</button>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-gray-800">Categories</h4>
                  {selectedCategory.length > 0 && (
                    <button onClick={() => setSelectedCategory([])} className="text-sm text-primary hover:underline">Clear</button>
                  )}
                </div>
                <ul className="space-y-3">
                  {JobCategories.map((category, index) => (
                    <li key={index} className="flex items-center">
                      <input
                        className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300"
                        type="checkbox"
                        onChange={() => handleCategoryChange(category)}
                        checked={selectedCategory.includes(category)}
                        id={`category-${index}`}
                      />
                      <label htmlFor={`category-${index}`} className="ml-3 text-gray-700 cursor-pointer hover:text-primary transition-colors">{category}</label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Locations */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-gray-800">Locations</h4>
                  {selectedLocation.length > 0 && (
                    <button onClick={() => setSelectedLocation([])} className="text-sm text-primary hover:underline">Clear</button>
                  )}
                </div>
                <ul className="space-y-3">
                  {JobLocations.slice(0, showAllLocations ? JobLocations.length : 5).map((location, index) => (
                    <li key={index} className="flex items-center">
                      <input
                        className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300"
                        type="checkbox"
                        onChange={() => handleLocationChange(location)}
                        checked={selectedLocation.includes(location)}
                        id={`location-${index}`}
                      />
                      <label htmlFor={`location-${index}`} className="ml-3 text-gray-700 cursor-pointer hover:text-primary transition-colors">{location}</label>
                    </li>
                  ))}
                </ul>
                {JobLocations.length > 5 && (
                  <button onClick={() => setShowAllLocations(!showAllLocations)} className="mt-2 text-sm text-primary hover:underline">
                    {showAllLocations ? 'Show less' : `Show all (${JobLocations.length})`}
                  </button>
                )}
              </div>

              {/* New Filters: Job Type */}
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Job Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={type}
                        className="h-4 w-4 text-primary"
                        checked={searchFilter.jobType === type}
                        onChange={() => setSearchFilter({ ...searchFilter, jobType: searchFilter.jobType === type ? '' : type })}
                      />
                      <label htmlFor={type} className="ml-3 text-gray-700">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Mode */}
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Work Mode</h4>
                <div className="space-y-2">
                  {['Remote', 'Hybrid', 'On-site'].map((mode) => (
                    <div key={mode} className="flex items-center">
                      <input
                        type="checkbox"
                        id={mode}
                        className="h-4 w-4 text-primary"
                        checked={searchFilter.workMode === mode}
                        onChange={() => setSearchFilter({ ...searchFilter, workMode: searchFilter.workMode === mode ? '' : mode })}
                      />
                      <label htmlFor={mode} className="ml-3 text-gray-700">{mode}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Posted */}
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Date Posted</h4>
                <div className="space-y-2">
                  {[{ label: 'Last 24 hours', value: '24h' }, { label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }, { label: 'Any time', value: '' }].map((item) => (
                    <div key={item.value} className="flex items-center">
                      <input
                        type="radio"
                        name="datePosted"
                        id={`date-${item.value}`}
                        className="h-4 w-4 text-primary"
                        checked={selectedDatePosted === item.value}
                        onChange={() => setSelectedDatePosted(item.value)}
                      />
                      <label htmlFor={`date-${item.value}`} className="ml-3 text-gray-700">{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Score */}
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Match Score</h4>
                <div className="space-y-2">
                  {[{ label: 'High (>70%)', value: 'high' }, { label: 'Medium (40-70%)', value: 'medium' }, { label: 'All', value: '' }].map((item) => (
                    <div key={item.value} className="flex items-center">
                      <input
                        type="radio"
                        name="matchScore"
                        id={`match-${item.value}`}
                        className="h-4 w-4 text-primary"
                        checked={selectedMatchScore === item.value}
                        onChange={() => setSelectedMatchScore(item.value)}
                      />
                      <label htmlFor={`match-${item.value}`} className="ml-3 text-gray-700">{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Multi-Select */}
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {JobSkills.slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillChange(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedSkills.includes(skill)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                        }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* JOB LIST */}
      <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4" id="job-list">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-3xl">Latest Jobs</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Recent</option>
              <option value="salary">Salary (High to Low)</option>
              <option value="match">Match Score</option>
            </select>
          </div>
        </div>

        <div className="min-h-[500px]">
          {filterJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
              layout
            >
              <AnimatePresence>
                {filterJobs
                  .slice((currentPage - 1) * 6, currentPage * 6)
                  .map((job, index) => (
                    <motion.div
                      key={job.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <JobCard job={job} matchScore={job.matchScore} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {filterJobs.length > 0 && (
          <motion.div
            className="flex items-center justify-center space-x-2 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-300' : 'text-primary hover:bg-primary hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {Array.from({ length: Math.ceil(filterJobs.length / 6) }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${currentPage === index + 1
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filterJobs.length / 6)))}
              disabled={currentPage === Math.ceil(filterJobs.length / 6)}
              className={`p-2 rounded-full ${currentPage === Math.ceil(filterJobs.length / 6) ? 'text-gray-300' : 'text-primary hover:bg-primary hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default JobListing;