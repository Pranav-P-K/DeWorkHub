import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user || user.role !== "Freelancer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get form data
    const formData = await req.formData()
    const jobId = formData.get("jobId") as string
    const coverLetter = formData.get("coverLetter") as string
    const resumeLink = formData.get("resumeLink") as string

    if (!jobId || !resumeLink) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      freelancerId: user.id,
    })

    if (existingApplication) {
      return NextResponse.json({ message: "You have already applied for this job" }, { status: 400 })
    }

    // Create application record
    const application = new Application({
      jobId,
      freelancerId: user.id,
      coverLetter,
      resumeLink,
      status: "applied",
    })

    await application.save()

    // Update job's applicants array
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: user.id },
    })

    return NextResponse.json({ message: "Application submitted successfully" })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ message: "Failed to submit application" }, { status: 500 })
  }
}

