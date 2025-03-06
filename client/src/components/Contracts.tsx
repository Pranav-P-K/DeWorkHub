"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { StarIcon } from "lucide-react"

interface Job {
  _id: string
  title: string
  description: string
  budget: number
}

interface User {
  _id: string
  name: string
  email: string
}

interface Contract {
  _id: string
  jobId: Job
  companyId: User
  freelancerId: User
  escrowAmount: number
  status: "ongoing" | "completed" | "disputed"
  paymentStatus: "pending" | "paid"
  createdAt: string
  updatedAt: string
  disputeReason?: string
}

const Contracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<"Freelancer" | "Company" | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [feedback, setFeedback] = useState<string>("")
  const [disputeReason, setDisputeReason] = useState<string>("")

  useEffect(() => {
    const fetchUserAndContracts = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("You must be logged in")
          setLoading(false)
          return
        }

        // Fetch user info
        const userRes = await axios.get("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserRole(userRes.data.user.role)

        // Fetch contracts
        const contractsRes = await axios.get("/api/contracts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setContracts(contractsRes.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load contracts")
        setLoading(false)
      }
    }

    fetchUserAndContracts()
  }, [])

  const handlePayment = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post("/api/contracts/payment", { contractId }, { headers: { Authorization: `Bearer ${token}` } })

      // Refresh contracts
      const contractsRes = await axios.get("/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContracts(contractsRes.data)

      alert("Payment processed successfully")
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

      // Refresh contracts
      const contractsRes = await axios.get("/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContracts(contractsRes.data)

      setSelectedContract(null)
      setRating(5)
      setFeedback("")

      alert("Contract marked as completed")
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

      // Refresh contracts
      const contractsRes = await axios.get("/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContracts(contractsRes.data)

      setSelectedContract(null)
      setDisputeReason("")

      alert("Dispute filed successfully")
    } catch (error) {
      console.error("Error filing dispute:", error)
      alert("Failed to file dispute")
    }
  }

  const renderContractStatus = (status: string) => {
    switch (status) {
      case "ongoing":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Ongoing</span>
      case "completed":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Completed</span>
      case "disputed":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Disputed</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>
    }
  }

  const renderPaymentStatus = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Payment Pending</span>
      case "paid":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paid</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>
    }
  }

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 cursor-pointer ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    )
  }

  const renderContractActions = (contract: Contract) => {
    if (userRole !== "Company") return null

    if (contract.status === "ongoing") {
      return (
        <div className="mt-4 space-y-2">
          {contract.paymentStatus === "pending" && (
            <button
              onClick={() => handlePayment(contract._id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Process Payment
            </button>
          )}

          {contract.paymentStatus === "paid" && (
            <>
              <button
                onClick={() => setSelectedContract(contract)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Complete Contract
              </button>
              <button
                onClick={() => {
                  setSelectedContract(contract)
                  setDisputeReason("")
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
              >
                File Dispute
              </button>
            </>
          )}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{userRole === "Freelancer" ? "My Contracts" : "Manage Contracts"}</h1>

      {contracts.length === 0 ? (
        <p className="text-gray-600">No contracts found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div key={contract._id} className="border rounded-lg shadow-sm p-4 bg-white">
              <h2 className="font-bold text-lg">{contract.jobId.title}</h2>

              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{userRole === "Freelancer" ? "Client:" : "Freelancer:"}</span>{" "}
                  {userRole === "Freelancer" ? contract.companyId.name : contract.freelancerId.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Budget:</span> ${contract.escrowAmount}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Started:</span> {new Date(contract.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {renderContractStatus(contract.status)}
                {renderPaymentStatus(contract.paymentStatus)}
              </div>

              {contract.disputeReason && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm">
                  <p className="font-medium text-red-800">Dispute Reason:</p>
                  <p className="text-red-700">{contract.disputeReason}</p>
                </div>
              )}

              {renderContractActions(contract)}
            </div>
          ))}
        </div>
      )}

      {/* Complete Contract Modal */}
      {selectedContract && !disputeReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Complete Contract</h2>
            <p className="mb-4">Please rate the freelancers work and provide feedback:</p>

            {renderStarRating()}

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback about the freelancer's work..."
              className="w-full p-2 border rounded mt-4"
              rows={4}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setSelectedContract(null)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleCompleteContract(selectedContract._id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {selectedContract && disputeReason !== undefined && (
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
              <button onClick={() => setSelectedContract(null)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={() => handleDisputeContract(selectedContract._id)}
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

export default Contracts

