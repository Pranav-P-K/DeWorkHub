'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import JobApplication from './JobApplication';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Briefcase, ChevronRight, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budget: number;
  companyId: Company;
  status: string;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  status: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplication, setShowApplication] = useState(false);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const jobsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch jobs that are open only
        const jobsRes = await axios.get('/api/jobs/available');
        setJobs(jobsRes.data);
        
        // Fetch user's applications
        const token = localStorage.getItem('token');
        if (token) {
          const applicationsRes = await axios.get('/api/applications/my-applications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMyApplications(applicationsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Add a slight delay for the loading animation
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.requiredSkills.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getApplicationForJob = (jobId: string) => {
    return myApplications.find(app => app.jobId._id === jobId);
  };

  const getApplicationStatus = (jobId: string) => {
    const application = getApplicationForJob(jobId);
    if (!application) return null;
    
    switch(application.status) {
      case 'applied':
        return 'Under Review';
      case 'reviewed':
        return 'Being Reviewed';
      case 'hired':
        return 'You are Hired!';
      case 'rejected':
        return 'Not Selected';
      default:
        return application.status;
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    
    switch(status) {
      case 'You are Hired!':
        return <Award className="w-4 h-4 text-green-600" />;
      case 'Not Selected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Under Review':
      case 'Being Reviewed':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleApplicationSubmit = async () => {
    try {
      // Refresh user's applications
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyApplications(res.data);
      }
      
      setShowApplication(false);
      
      // Show success message with animation
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg transition-all';
      successMessage.innerHTML = 'Application submitted successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.style.opacity = '0';
        setTimeout(() => document.body.removeChild(successMessage), 500);
      }, 3000);
    } catch (error) {
      console.error('Error refreshing applications:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading opportunities...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-[calc(100vh-80px)]"
    >
      {/* Left Column (Jobs List) */}
      <div className="w-2/5 p-6 border-r bg-gradient-to-b from-blue-50 to-white shadow-inner">
        <div className="relative mb-6">
          <motion.div 
            className={`flex items-center px-3 py-3 bg-white border rounded-lg shadow-sm transition-all ${isSearchFocused ? 'ring-2 ring-blue-400' : ''}`}
            animate={{ scale: isSearchFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search jobs or skills..."
              className="w-full outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </motion.div>
        </div>

        <motion.div 
          className="mb-4 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-800">Available Jobs</h2>
          <span className="text-sm font-medium text-gray-500">{filteredJobs.length} positions</span>
        </motion.div>

        <div className="overflow-y-auto max-h-[calc(100vh-220px)]" ref={jobsContainerRef}>
          <AnimatePresence>
            {filteredJobs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-10 text-gray-500"
              >
                <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No jobs found matching your search criteria</p>
              </motion.div>
            ) : (
              <ul className="space-y-3">
                {filteredJobs.map((job, index) => {
                  const applicationStatus = getApplicationStatus(job._id);
                  const statusIcon = getStatusIcon(applicationStatus);
                  
                  return (
                    <motion.li
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplication(false);
                      }}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                        selectedJob?._id === job._id 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-white hover:bg-blue-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between">
                        <h3 className={`font-semibold ${selectedJob?._id === job._id ? 'text-white' : 'text-gray-800'}`}>
                          {job.title}
                        </h3>
                        <ChevronRight className={`w-5 h-5 ${selectedJob?._id === job._id ? 'text-blue-200' : 'text-gray-400'}`} />
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 3).map(skill => (
                          <span 
                            key={skill} 
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedJob?._id === job._id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedJob?._id === job._id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm font-medium ${
                          selectedJob?._id === job._id ? 'text-blue-100' : 'text-blue-600'
                        }`}>
                          ${job.budget.toLocaleString()}
                        </span>
                        {applicationStatus && (
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            selectedJob?._id === job._id
                              ? applicationStatus === 'You are Hired!' 
                                ? 'bg-green-600 text-white' 
                                : applicationStatus === 'Not Selected'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-blue-500 text-white'
                              : applicationStatus === 'You are Hired!' 
                                ? 'bg-green-100 text-green-800' 
                                : applicationStatus === 'Not Selected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}>
                            {statusIcon}
                            <span className="ml-1">{applicationStatus}</span>
                          </div>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column (Job Details) */}
      <div className="w-3/5 p-8 bg-white overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedJob ? (
            <motion.div
              key={selectedJob._id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-800"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {selectedJob.title}
              </motion.h2>
              
              <motion.div
                className="flex items-center gap-2 text-gray-600 mb-6"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Briefcase className="w-4 h-4" />
                <span>Posted by: </span>
                <span className="font-medium text-blue-600">
                  {selectedJob.companyId?.name || "Unknown Company"}
                </span>
              </motion.div>
              
              <motion.div 
                className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </motion.div>

              <motion.div
                className="mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((skill, idx) => (
                    <motion.span 
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div>
                  <span className="text-sm text-blue-600 font-medium">Project Budget</span>
                  <p className="text-2xl font-bold text-gray-800">${selectedJob.budget.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {showApplication ? (
                  <JobApplication 
                    jobId={selectedJob._id} 
                    onApplicationSubmit={handleApplicationSubmit} 
                  />
                ) : (
                  (() => {
                    const applicationStatus = getApplicationStatus(selectedJob._id);
                    if (applicationStatus) {
                      return (
                        <div className={`mt-6 p-6 rounded-lg shadow-sm border ${
                          applicationStatus === 'You are Hired!' 
                            ? 'bg-green-50 border-green-200' 
                            : applicationStatus === 'Not Selected'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            {applicationStatus === 'You are Hired!' ? (
                              <Award className="w-6 h-6 text-green-600" />
                            ) : applicationStatus === 'Not Selected' ? (
                              <XCircle className="w-6 h-6 text-red-600" />
                            ) : (
                              <Clock className="w-6 h-6 text-blue-600" />
                            )}
                            <h4 className={`font-semibold ${
                              applicationStatus === 'You are Hired!' 
                                ? 'text-green-700' 
                                : applicationStatus === 'Not Selected'
                                  ? 'text-red-700'
                                  : 'text-blue-700'
                            }`}>
                              {applicationStatus}
                            </h4>
                          </div>
                          
                          <p className={`text-sm mb-4 ${
                            applicationStatus === 'You are Hired!' 
                              ? 'text-green-600' 
                              : applicationStatus === 'Not Selected'
                                ? 'text-red-600'
                                : 'text-blue-600'
                          }`}>
                            {applicationStatus === 'You are Hired!' 
                              ? 'Congratulations! You have been selected for this job.' 
                              : applicationStatus === 'Not Selected'
                                ? 'Thank you for your interest. The position has been filled.'
                                : 'Your application is being reviewed by the hiring team.'}
                          </p>
                          
                          {applicationStatus === 'You are Hired!' && (
                            <Link href="/my-contracts">
                              <motion.button 
                                className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm hover:bg-green-700 transition-all"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                View Contract Details
                              </motion.button>
                            </Link>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <motion.button
                          onClick={() => setShowApplication(true)}
                          className="mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all w-full"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Apply for this Job
                        </motion.button>
                      );
                    }
                  })()
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="h-full flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Select a job to view details</h3>
              <p className="text-gray-400 max-w-md">Browse through the available opportunities on the left and click on any job to see more information</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Jobs;