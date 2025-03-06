// Fix the hiring logic to select the chosen applicant and add contract management

"use client"

import { useEffect, useState } from "react"
import axios from "axios"

interface Job {
  _id: string
  title: string
  status: string
  applicants: string[]
  selectedFreelancer: string | null
}

interface Application {
  _id: string
  jobId: {
    _id: string
    title: string
  }
  freelancerId: {
    _id: string
    name: string
    email: string
  }
  coverLetter: string
  resumeLink: string
  status: string
  appliedAt: string
}

interface Contract {
  _id: string
  status: string
  paymentStatus: string
}

const Hire = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [feedback, setFeedback] = useState<string>("")
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("You must be logged in")
          setLoading(false)
          return
        }

        const res = await axios.get("/api/jobs/company-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setJobs(res.data)
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]._id)
          fetchApplications(res.data[0]._id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching company jobs:", error)
        setError("Failed to load jobs")
        setLoading(false)
      }
    }

    fetchCompanyJobs()
  }, [])

  const fetchApplications = async (jobId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const res = await axios.get(`/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setApplications(res.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching applications:", error)
      setError("Failed to load applications")
      setLoading(false)
    }
  }

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId)
    fetchApplications(jobId)
  }

  const handleHireFreelancer = async (applicationId: string, freelancerId: string) => {
    try {
      setProcessingId(applicationId)
      const token = localStorage.getItem("token")

      const response = await axios.post(
        "/api/applications/hire",
        { applicationId, jobId: selectedJob, freelancerId },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setSelectedContract(response.data.contractId)

      // Refresh the applications list
      if (selectedJob) {
        fetchApplications(selectedJob)
      }

      // Refresh the jobs list to update status
      const jobsRes = await axios.get("/api/jobs/company-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setJobs(jobsRes.data)

      setProcessingId(null)
    } catch (error) {
      console.error("Error hiring freelancer:", error)
      setError("Failed to hire freelancer")
      setProcessingId(null)
    }
  }

  const handlePayment = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post("/api/contracts/payment", { contractId }, { headers: { Authorization: `Bearer ${token}` } })

      alert("Payment processed successfully")

      // Refresh the jobs list to update status
      const jobsRes = await axios.get("/api/jobs/company-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setJobs(jobsRes.data)

      if (selectedJob) {
        fetchApplications(selectedJob)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Failed to process payment")
    }
  }

  const handleCompleteContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "/api/contracts/update",
        { contractId, status: "completed", rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setShowRatingModal(false)
      alert("Contract marked as completed")

      // Refresh the jobs list to update status
      const jobsRes = await axios.get("/api/jobs/company-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setJobs(jobsRes.data)

      if (selectedJob) {
        fetchApplications(selectedJob)
      }
    } catch (error) {
      console.error("Error completing contract:", error)
      alert("Failed to complete contract")
    }
  }

  const handleDisputeContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "/api/contracts/dispute",
        { contractId, reason: disputeReason },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setShowDisputeModal(false)
      alert("Dispute filed successfully")

      // Refresh the jobs list to update status
      const jobsRes = await axios.get("/api/jobs/company-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setJobs(jobsRes.data)

      if (selectedJob) {
        fetchApplications(selectedJob)
      }
    } catch (error) {
      console.error("Error filing dispute:", error)
      alert("Failed to file dispute")
    }
  }

  const getSelectedJobStatus = () => {
    if (!selectedJob) return null
    const job = jobs.find((j) => j._id === selectedJob)
    return job ? job.status : null
  }

  const jobStatus = getSelectedJobStatus()

  // Find the hired application for the selected job
  const hiredApplication = applications.find((app) => app.status === "hired")

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Column (Jobs List) */}
      <div className="w-1/4 p-6 border-r bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Your Jobs</h2>

        {jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li
                key={job._id}
                onClick={() => handleJobSelect(job._id)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedJob === job._id ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                <h3 className="font-semibold">{job.title}</h3>
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      job.status === "open"
                        ? "bg-green-100 text-green-800"
                        : job.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : job.status === "completed"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-600">
                    {job.applicants.length} {job.applicants.length === 1 ? "applicant" : "applicants"}
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
        ) : jobStatus === "in_progress" ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Job In Progress</h3>
            {hiredApplication ? (
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold text-lg">Hired Freelancer</h4>
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Name:</span> {hiredApplication.freelancerId.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {hiredApplication.freelancerId.email}
                  </p>
                  <a
                    href={hiredApplication.resumeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Resume
                  </a>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium">Cover Letter</h5>
                  <p className="mt-1 text-gray-700">{hiredApplication.coverLetter}</p>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => handlePayment(selectedContract?._id || "")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Process Payment
                  </button>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Complete Contract
                  </button>
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    File Dispute
                  </button>
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
              {applications.map((application) => (
                <div key={application._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-lg">{application.freelancerId.name}</h4>
                    <span className="text-sm text-gray-500">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-600">{application.freelancerId.email}</p>

                  <a
                    href={application.resumeLink}
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
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {processingId === application._id ? "Processing..." : "Hire Freelancer"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Rate Freelancer</h2>
            <p className="mb-4">Please rate the freelancers work:</p>

            <div className="flex items-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <svg
                    className={`w-8 h-8 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback about the freelancer's work..."
              className="w-full p-2 border rounded"
              rows={4}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowRatingModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleCompleteContract(selectedContract?._id || "")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">File a Dispute</h2>
            <p className="mb-4">Please explain the reason for filing a dispute:</p>

            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain why you're disputing this contract..."
              className="w-full p-2 border rounded"
              rows={4}
              required
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowDisputeModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleDisputeContract(selectedContract?._id || "")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!disputeReason.trim()}
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hire

