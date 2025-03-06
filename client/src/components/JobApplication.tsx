/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"

interface ApplicationProps {
  jobId: string
  onApplicationSubmit: () => void
}

const JobApplication = ({ jobId, onApplicationSubmit }: ApplicationProps) => {
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeLink, setResumeLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!resumeLink) {
      setError("Please provide your resume link")
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to apply")
        setIsSubmitting(false)
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append("jobId", jobId)
      formData.append("coverLetter", coverLetter)
      formData.append("resumeLink", resumeLink)

      await axios.post("/api/applications", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      onApplicationSubmit()
      // Reset form
      setCoverLetter("")
      setResumeLink("")
    } catch (error: any) {
      console.error("Error submitting application:", error)
      setError(error.response?.data?.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Apply for this Job</h3>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Tell the employer why you're a good fit for this position"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Resume Link</label>
          <input
            type="url"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Paste your Google Drive or other cloud storage link"
            required
          />
          <p className="text-gray-500 text-sm mt-1">Please provide a shareable link to your resume</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  )
}

export default JobApplication

