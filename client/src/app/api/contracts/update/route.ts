import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Contract from "@/models/Contract"
import Job from "@/models/Job"
import Review from "@/models/Review"
import { getUserFromToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user || user.role !== "Company") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { contractId, status, rating, feedback } = await req.json()

    if (!contractId || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Find the contract
    const contract = await Contract.findById(contractId)
    if (!contract) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 })
    }

    // Verify the contract belongs to this company
    if (contract.companyId.toString() !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Update contract status
    contract.status = status
    await contract.save()

    // If contract is completed, update job status
    if (status === "completed") {
      await Job.findByIdAndUpdate(contract.jobId, { status: "completed" })

      // Create review if rating is provided
      if (rating) {
        const review = new Review({
          contractId,
          freelancerId: contract.freelancerId,
          companyId: user.id,
          rating,
          feedback,
        })

        await review.save()
      }
    }

    return NextResponse.json({ message: `Contract marked as ${status}` })
  } catch (error) {
    console.error("Error updating contract:", error)
    return NextResponse.json({ message: "Failed to update contract" }, { status: 500 })
  }
}

