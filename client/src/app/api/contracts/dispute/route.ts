import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
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

    const { contractId, reason } = await req.json()

    if (!contractId || !reason) {
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

    // Update contract status and add dispute reason
    contract.status = "disputed"
    contract.disputeReason = reason
    await contract.save()

    return NextResponse.json({ message: "Dispute filed successfully" })
  } catch (error) {
    console.error("Error filing dispute:", error)
    return NextResponse.json({ message: "Failed to file dispute" }, { status: 500 })
  }
}

