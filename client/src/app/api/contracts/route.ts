import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Contract from "@/models/Contract"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    // Authenticate user
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let contracts

    if (user.role === "Freelancer") {
      // Get freelancer's contracts
      contracts = await Contract.find({ freelancerId: user.id })
        .populate("jobId")
        .populate("companyId", "name email")
        .sort({ createdAt: -1 })
    } else if (user.role === "Company") {
      // Get company's contracts
      contracts = await Contract.find({ companyId: user.id })
        .populate("jobId")
        .populate("freelancerId", "name email")
        .sort({ createdAt: -1 })
    } else {
      return NextResponse.json({ message: "Invalid user role" }, { status: 400 })
    }

    return NextResponse.json(contracts)
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json({ message: "Failed to fetch contracts" }, { status: 500 })
  }
}

