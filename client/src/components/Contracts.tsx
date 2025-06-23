/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { StarIcon, DollarSign, Calendar, AlertTriangle, Check, X, ChevronRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Web3JobIntegration from "./Web3JobIntegration"
import Web3Dispute from "./Web3Dispute"
import { toast } from "sonner"

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
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "completed" | "disputed">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [showWeb3Complete, setShowWeb3Complete] = useState(false)
  const [showWeb3Dispute, setShowWeb3Dispute] = useState(false)

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

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setSelectedContract(null)
        setDisputeReason("")
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const refreshContracts = async () => {
    try {
      setIsRefreshing(true)
      const token = localStorage.getItem("token")
      const contractsRes = await axios.get("/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContracts(contractsRes.data)
      setIsRefreshing(false)
    } catch (error) {
      console.error("Error refreshing contracts:", error)
      setIsRefreshing(false)
    }
  }

  const handlePayment = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post("/api/contracts/payment", { contractId }, { headers: { Authorization: `Bearer ${token}` } })
      await refreshContracts()
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
      
      await refreshContracts()
      setSelectedContract(null)
      setRating(5)
      setFeedback("")
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
      
      await refreshContracts()
      setSelectedContract(null)
      setDisputeReason("")
    } catch (error) {
      console.error("Error filing dispute:", error)
      alert("Failed to file dispute")
    }
  }

  const handleWeb3Complete = (contract: Contract) => {
    setSelectedContract(contract)
    setShowWeb3Complete(true)
  }

  const handleWeb3CompleteSuccess = () => {
    setShowWeb3Complete(false)
    setSelectedContract(null)
    toast.success("Job completed successfully on blockchain!")
    refreshContracts()
  }

  const handleWeb3Dispute = (contract: Contract) => {
    setSelectedContract(contract)
    setShowWeb3Dispute(true)
  }

  const handleWeb3DisputeSuccess = () => {
    setShowWeb3Dispute(false)
    setSelectedContract(null)
    toast.success("Dispute handled successfully on blockchain!")
    refreshContracts()
  }

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === "all") return true;
    return contract.status === activeTab;
  });

  const getStatusColors = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-600 text-white";
      case "completed":
        return "bg-emerald-600 text-white";
      case "disputed":
        return "bg-red-600 text-white";
      case "pending":
        return "bg-amber-600 text-white";
      case "paid":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  }

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <StarIcon
              className={`h-6 w-6 cursor-pointer ${
                star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  const renderContractActions = (contract: Contract) => {
    if (userRole !== "Company") return null;

    if (contract.status === "ongoing") {
      return (
        <div className="mt-4 space-y-2">
          {contract.paymentStatus === "pending" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePayment(contract._id)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 font-medium"
            >
              <DollarSign className="h-4 w-4" />
              Process Payment
            </motion.button>
          )}

          {contract.paymentStatus === "paid" && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedContract(contract)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 font-medium"
              >
                <Check className="h-4 w-4" />
                Complete Contract
              </motion.button>

              {/* Web3 Complete Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWeb3Complete(contract)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Complete on Blockchain
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedContract(contract)
                  setDisputeReason("")
                }}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 font-medium"
              >
                <AlertTriangle className="h-4 w-4" />
                File Dispute
              </motion.button>

              {/* Web3 Dispute Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWeb3Dispute(contract)}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg w-full flex items-center justify-center gap-2 font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Dispute on Blockchain
              </motion.button>
            </>
          )}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 className="h-12 w-12 text-blue-600" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-blue-800 font-medium"
        >
          Loading your contracts...
        </motion.p>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-md mx-auto mt-12 bg-red-50 border border-red-200 rounded-lg shadow-md"
      >
        <div className="flex items-center text-red-600 mb-2">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h2 className="font-bold text-lg">Error</h2>
        </div>
        <p className="text-red-700">{error}</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {userRole === "Freelancer" ? "My Contracts" : "Manage Contracts"}
          </h1>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshContracts}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white rounded-full shadow hover:shadow-md flex items-center gap-2 text-blue-600"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
            Refresh
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {["all", "ongoing", "completed", "disputed"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all capitalize ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {filteredContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl shadow-sm"
        >
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-blue-50">
            <Calendar className="h-12 w-12 text-blue-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No contracts found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === "all" 
              ? "You don't have any contracts yet." 
              : `You don't have any ${activeTab} contracts.`}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredContracts.map((contract, index) => (
              <motion.div
                key={contract._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300"
              >
                <div className={`h-2 ${getStatusColors(contract.status)}`}></div>
                <div className="p-5">
                  <h2 className="font-bold text-lg text-gray-800 line-clamp-1">{contract.jobId.title}</h2>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          {userRole === "Freelancer" ? "CLIENT" : "FREELANCER"}
                        </p>
                        <p className="font-medium">
                          {userRole === "Freelancer" ? contract.companyId.name : contract.freelancerId.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">BUDGET</p>
                        <p className="font-medium">${contract.escrowAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">STARTED</p>
                        <p className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColors(contract.status)}`}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColors(contract.paymentStatus)}`}>
                      {contract.paymentStatus.charAt(0).toUpperCase() + contract.paymentStatus.slice(1)}
                    </span>
                  </div>

                  {contract.disputeReason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                        <p className="font-medium text-red-700 text-sm">Dispute Reason:</p>
                      </div>
                      <p className="text-red-600 text-sm">{contract.disputeReason}</p>
                    </motion.div>
                  )}

                  {renderContractActions(contract)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Complete Contract Modal */}
      <AnimatePresence>
        {selectedContract && !disputeReason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Complete Contract</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedContract(null)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-blue-800 text-sm">
                  You are completing the contract {selectedContract.jobId.title} with{" "}
                  <span className="font-medium">{selectedContract.freelancerId.name}</span>
                </p>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Rate the freelancer:</h3>
              {renderStarRating()}

              <h3 className="font-medium text-gray-700 mt-4 mb-2">Provide feedback:</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience working with this freelancer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={4}
              />

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedContract(null)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCompleteContract(selectedContract._id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow hover:shadow-md"
                >
                  Complete Contract
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {selectedContract && disputeReason !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">File a Dispute</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedContract(null)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg mb-4">
                <div className="flex items-center mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                  <p className="font-medium text-red-700">Warning</p>
                </div>
                <p className="text-red-600 text-sm">
                  Filing a dispute will halt all payments and require administrative review. 
                  Please try to resolve issues directly with the freelancer first.
                </p>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Explain your reason:</h3>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Please provide details about why you're disputing this contract..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                rows={4}
                required
              />

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedContract(null)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDisputeContract(selectedContract._id)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow hover:shadow-md"
                  disabled={!disputeReason.trim()}
                >
                  Submit Dispute
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web3 Complete Modal */}
      {showWeb3Complete && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Complete Job on Blockchain</h2>
              <button
                onClick={() => setShowWeb3Complete(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Web3JobIntegration
              mode="complete"
              jobId={selectedContract.jobId._id}
              jobDetails={{
                title: selectedContract.jobId.title,
                budget: selectedContract.escrowAmount,
                companyName: selectedContract.companyId.name
              }}
              onSuccess={handleWeb3CompleteSuccess}
            />
          </div>
        </div>
      )}

      {/* Web3 Dispute Modal */}
      {showWeb3Dispute && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Web3 Dispute Resolution</h2>
              <button
                onClick={() => setShowWeb3Dispute(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Web3Dispute
              jobId={selectedContract.jobId._id}
              userRole={userRole || 'Company'}
              onDisputeRaised={handleWeb3DisputeSuccess}
              onDisputeResolved={handleWeb3DisputeSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Contracts