"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import JobApplication from "./JobApplication"

interface Company {
  _id: string
  name: string
}

interface Job {
  _id: string
  title: string
  description: string
  requiredSkills: string[]
  budget: number
  companyId: Company
  status: string
}

interface Application {
  _id: string
  jobId: string
  status: string
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showApplication, setShowApplication] = useState(false)
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch jobs
        const jobsRes = await axios.get("/api/jobs")
        setJobs(jobsRes.data)

        // Fetch user's applications
        const token = localStorage.getItem("token")
        if (token) {
          const applicationsRes = await axios.get("/api/applications/my-applications", {
            headers: { Authorization: `Bearer ${token}` },
          })
          setMyApplications(applicationsRes.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredJobs = jobs.filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const hasApplied = (jobId: string) => {
    return myApplications.some((app) => app.jobId === jobId)
  }

  const handleApplicationSubmit = async () => {
    try {
      // Refresh user's applications
      const token = localStorage.getItem("token")
      if (token) {
        const res = await axios.get("/api/applications/my-applications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMyApplications(res.data)
      }

      setShowApplication(false)
      alert("Application submitted successfully!")
    } catch (error) {
      console.error("Error refreshing applications:", error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

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
          {filteredJobs.map((job) => (
            <li
              key={job._id}
              onClick={() => {
                setSelectedJob(job)
                setShowApplication(false)
              }}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedJob?._id === job._id ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.requiredSkills.join(", ")}</p>
              {hasApplied(job._id) && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                  Application under review
                </span>
              )}
            </li>
          ))}
        </ul>
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
                {selectedJob.requiredSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <p className="mt-4 font-semibold">Budget: ${selectedJob.budget}</p>

            {showApplication ? (
              <JobApplication jobId={selectedJob._id} onApplicationSubmit={handleApplicationSubmit} />
            ) : hasApplied(selectedJob._id) ? (
              <div className="mt-6 bg-yellow-50 text-yellow-700 p-4 rounded-md">Your application is under review</div>
            ) : (
              <button
                onClick={() => setShowApplication(true)}
                className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Apply for this Job
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Select a job to view details</p>
        )}
      </div>
    </div>
  )
}

export default Jobs

