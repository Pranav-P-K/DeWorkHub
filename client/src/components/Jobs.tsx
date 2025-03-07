'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import JobApplication from './JobApplication';
import Link from 'next/link';

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
        setLoading(false);
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
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error refreshing applications:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Column (Jobs List) */}
      <div className="w-2/5 p-6 border-r bg-gray-100">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search jobs or skills..."
            className="w-full px-3 py-2 border rounded-md"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No jobs found matching your search criteria
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredJobs.map(job => {
              const applicationStatus = getApplicationStatus(job._id);
              
              return (
                <li
                  key={job._id}
                  onClick={() => {
                    setSelectedJob(job);
                    setShowApplication(false);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedJob?._id === job._id ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.requiredSkills.join(', ')}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      ${job.budget}
                    </span>
                    {applicationStatus && (
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        applicationStatus === 'You are Hired!' 
                          ? 'bg-green-100 text-green-800' 
                          : applicationStatus === 'Not Selected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {applicationStatus}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Right Column (Job Details) */}
      <div className="w-3/5 p-6">
        {selectedJob ? (
          <div>
            <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
            <p className="text-gray-600 mb-4">Posted by: {selectedJob.companyId?.name || "Unknown Company"}</p>
            <p className="text-gray-700 mt-2">{selectedJob.description}</p>

            <div className="mt-4">
              <h4 className="font-semibold">Required Skills:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {selectedJob.requiredSkills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 font-semibold">Budget: ${selectedJob.budget}</p>

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
                    <div className={`mt-6 p-4 rounded-md ${
                      applicationStatus === 'You are Hired!' 
                        ? 'bg-green-50 text-green-700' 
                        : applicationStatus === 'Not Selected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                    }`}>
                      <p className="font-medium">Status: {applicationStatus}</p>
                      {applicationStatus === 'You are Hired!' && (
                        <Link href="/my-contracts">
                          <button className="mt-2 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700">
                            View Contract Details
                          </button>
                        </Link>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <button
                      onClick={() => setShowApplication(true)}
                      className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Apply for this Job
                    </button>
                  );
                }
              })()
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Select a job to view details</p>
        )}
      </div>
    </div>
  );
};

export default Jobs;