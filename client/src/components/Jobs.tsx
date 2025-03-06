'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budget: number;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/jobs');
        setJobs(res.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Column (Jobs List) */}
      <div className="w-2/5 p-6 border-r bg-gray-100">
        <input
          type="text"
          placeholder="Search jobs..."
          className="w-full px-3 py-2 border rounded-md mb-4"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <ul className="space-y-3">
          {filteredJobs.map(job => (
            <li
              key={job._id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedJob?._id === job._id ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.requiredSkills.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column (Job Details) */}
      <div className="w-3/5 p-6">
        {selectedJob ? (
          <div>
            <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
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
          </div>
        ) : (
          <p className="text-gray-600 text-center">Select a job to view details</p>
        )}
      </div>
    </div>
  );
};

export default Jobs;
