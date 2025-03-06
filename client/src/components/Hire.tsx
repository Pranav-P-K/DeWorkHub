'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  status: string;
  applicants: string[];
  selectedFreelancer: string | null;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  freelancerId: {
    _id: string;
    name: string;
    email: string;
  };
  coverLetter: string;
  resumePath: string;
  status: string;
  appliedAt: string;
}

const Hire = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in');
          setLoading(false);
          return;
        }

        const res = await axios.get('/api/jobs/company-jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setJobs(res.data);
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]._id);
          fetchApplications(res.data[0]._id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching company jobs:', error);
        setError('Failed to load jobs');
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, []);

  const fetchApplications = async (jobId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get(`/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplications(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId);
    fetchApplications(jobId);
  };

  const handleHireFreelancer = async (applicationId: string, freelancerId: string) => {
    try {
      setProcessingId(applicationId);
      const token = localStorage.getItem('token');
      
      await axios.post('/api/applications/hire', 
        { applicationId, jobId: selectedJob, freelancerId },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Refresh the applications list
      if (selectedJob) {
        fetchApplications(selectedJob);
      }
      
      // Refresh the jobs list to update status
      const jobsRes = await axios.get('/api/jobs/company-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobsRes.data);
      
      setProcessingId(null);
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      setError('Failed to hire freelancer');
      setProcessingId(null);
    }
  };

  const getSelectedJobStatus = () => {
    if (!selectedJob) return null;
    const job = jobs.find(j => j._id === selectedJob);
    return job ? job.status : null;
  };

  const jobStatus = getSelectedJobStatus();

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Column (Jobs List) */}
      <div className="w-1/4 p-6 border-r bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Your Jobs</h2>
        
        {jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map(job => (
              <li
                key={job._id}
                onClick={() => handleJobSelect(job._id)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedJob === job._id ? 'bg-blue-500 text-white' : 'bg-white'
                }`}
              >
                <h3 className="font-semibold">{job.title}</h3>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    job.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : job.status === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-600">
                    {job.applicants.length} {job.applicants.length === 1 ? 'applicant' : 'applicants'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Column (Applications) */}
      <div className="w-3/4 p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !selectedJob ? (
          <div className="text-gray-600 text-center">Select a job to view applications</div>
        ) : jobStatus === 'in_progress' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Job In Progress</h3>
            {applications.length > 0 ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-lg">Hired Freelancer</h4>
                <div className="mt-2">
                  <p><span className="font-medium">Name:</span> {applications[0].freelancerId.name}</p>
                  <p><span className="font-medium">Email:</span> {applications[0].freelancerId.email}</p>
                  <a 
                    href={applications[0].resumePath} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Resume
                  </a>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium">Cover Letter</h5>
                  <p className="mt-1 text-gray-700">{applications[0].coverLetter}</p>
                </div>
              </div>
            ) : (
              <p>No hired freelancer found</p>
            )}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-gray-600 text-center">No applications received yet</div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4">Applications</h3>
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-lg">{application.freelancerId.name}</h4>
                    <span className="text-sm text-gray-500">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600">{application.freelancerId.email}</p>
                  
                  <a 
                    href={application.resumePath} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Resume
                  </a>
                  
                  <div className="mt-4 pt-2 border-t">
                    <h5 className="font-medium">Cover Letter</h5>
                    <p className="mt-1 text-gray-700">{application.coverLetter}</p>
                  </div>
                  
                  <button
                    onClick={() => handleHireFreelancer(application._id, application.freelancerId._id)}
                    disabled={processingId === application._id}
                    className={`mt-4 py-2 px-4 rounded ${
                      processingId === application._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {processingId === application._id ? 'Processing...' : 'Hire Freelancer'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hire;