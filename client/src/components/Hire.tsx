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
    <div className="flex h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-gray-100 sm:flex-row">
      {/* Left Column (Jobs List) */}
      <div className="w-1/4 p-6 border-r border-gray-200 overflow-y-auto shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="bg-blue-500 w-2 h-6 rounded mr-2"></span>
          Your Jobs
        </h2>
  
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl p-6 shadow-sm">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-600 text-center">No jobs posted yet</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job, index) => (
              <li
                key={job._id}
                onClick={() => handleJobSelect(job._id)}
                className={`p-4 border rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-md ${
                  selectedJob === job._id 
                    ? "bg-blue-500 text-white shadow-lg translate-x-2" 
                    : "bg-white hover:bg-blue-50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <div className="flex justify-between mt-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
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
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedJob === job._id ? "bg-blue-400" : "bg-gray-200"}`}>
                    {job.applicants.length} {job.applicants.length === 1 ? "applicant" : "applicants"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
  
      {/* Right Column (Applications) */}
      <div className="w-3/4 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 animate-pulse">
            <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        ) : !selectedJob ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <p className="text-xl">Select a job to view applications</p>
          </div>
        ) : jobStatus === "in_progress" ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-lg transition-all duration-500 animate-fadeIn">
            <h3 className="text-2xl font-bold mb-6 text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Job In Progress
            </h3>
            {hiredApplication ? (
              <div className="bg-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg">
                <h4 className="font-semibold text-xl text-blue-700 mb-4 border-b pb-2">Hired Freelancer</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium text-gray-700">Name:</span> {hiredApplication.freelancerId.name}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium text-gray-700">Email:</span> {hiredApplication.freelancerId.email}
                    </p>
                    <a
                      href={hiredApplication.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center mt-2 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Resume
                    </a>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">Cover Letter</h5>
                    <p className="text-gray-700 italic">{hiredApplication.coverLetter}</p>
                  </div>
                </div>
  
                <div className="mt-6 flex flex-wrap gap-4 justify-end">
                  <button
                    onClick={() => handlePayment(selectedContract?._id || "")}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Process Payment
                  </button>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Complete Contract
                  </button>
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    File Dispute
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <p className="text-gray-600">No hired freelancer found</p>
              </div>
            )}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p className="text-gray-600 text-xl">No applications received yet</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Applications
            </h3>
            <div className="space-y-6">
              {applications.map((application, index) => (
                <div 
                  key={application._id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-xl text-gray-800">{application.freelancerId.name}</h4>
                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
  
                  <p className="text-gray-600 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {application.freelancerId.email}
                  </p>
  
                  <a
                    href={application.resumeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center mt-1 mb-4 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Resume
                  </a>
  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-medium text-gray-800 mb-2">Cover Letter</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{application.coverLetter}</p>
                    </div>
                  </div>
  
                  <button
                    onClick={() => handleHireFreelancer(application._id, application.freelancerId._id)}
                    disabled={processingId === application._id}
                    className={`mt-6 py-2 px-6 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:translate-y-1 ${
                      processingId === application._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {processingId === application._id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Hire Freelancer
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-slideUp">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Rate Freelancer</h2>
            <p className="mb-6 text-gray-600">Please rate the freelancers work:</p>
  
            <div className="flex items-center space-x-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)} 
                  className="focus:outline-none transform transition hover:scale-125 duration-200"
                >
                  <svg
                    className={`w-10 h-10 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              rows={4}
            />
  
            <div className="flex justify-end space-x-4 mt-6">
              <button 
                onClick={() => setShowRatingModal(false)} 
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteContract(selectedContract?._id || "")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-slideUp">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">File a Dispute</h2>
            </div>
            <p className="mb-6 text-gray-600">Please explain the reason for filing a dispute:</p>
  
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain why you're disputing this contract..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              rows={4}
              required
            />
  
            <div className="flex justify-end space-x-4 mt-6">
              <button 
                onClick={() => setShowDisputeModal(false)} 
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisputeContract(selectedContract?._id || "")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                disabled={!disputeReason.trim()}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
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

