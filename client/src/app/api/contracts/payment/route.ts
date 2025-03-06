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

    const { contractId } = await req.json()

    if (!contractId) {
      return NextResponse.json({ message: "Missing contract ID" }, { status: 400 })
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

    // Update payment status
    contract.paymentStatus = "paid"
    await contract.save()

    return NextResponse.json({ message: "Payment processed successfully" })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ message: "Failed to process payment" }, { status: 500 })
  }
}

