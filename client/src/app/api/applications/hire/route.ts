import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Application from "@/models/Application"
import Job from "@/models/Job"
import Contract from "@/models/Contract"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user || user.role !== "Company") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { applicationId, jobId, freelancerId } = await req.json()

    if (!applicationId || !jobId || !freelancerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify the job belongs to this company
    const job = await Job.findOne({ _id: jobId, companyId: user.id })
    if (!job) {
      return NextResponse.json({ message: "Job not found or unauthorized" }, { status: 404 })
    }

    // Check if job is already in progress
    if (job.status !== "open") {
      return NextResponse.json(
        {
          message: "This job is not open for hiring",
        },
        { status: 400 },
      )
    }

    // Update the selected application status
    await Application.findByIdAndUpdate(applicationId, { status: "hired" })

    // Update the job status and selected freelancer
    await Job.findByIdAndUpdate(jobId, {
      status: "in_progress",
      selectedFreelancer: freelancerId,
    })

    // Reject all other applications for this job
    await Application.updateMany({ jobId, _id: { $ne: applicationId } }, { status: "rejected" })

    // Create a contract
    const contract = new Contract({
      jobId,
      companyId: user.id,
      freelancerId,
      escrowAmount: job.budget,
      status: "ongoing",
      paymentStatus: "pending",
    })

    await contract.save()

    return NextResponse.json({
      message: "Freelancer hired successfully",
      contractId: contract._id,
    })
  } catch (error) {
    console.error("Error hiring freelancer:", error)
    return NextResponse.json({ message: "Failed to hire freelancer" }, { status: 500 })
  }
}

