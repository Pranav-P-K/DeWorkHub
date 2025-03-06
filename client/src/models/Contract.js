import mongoose from "mongoose"

const ContractSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    escrowAmount: { type: Number, required: true },
    status: { type: String, enum: ["ongoing", "completed", "disputed"], default: "ongoing" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    disputeReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

const Contract = mongoose.models.Contract || mongoose.model("Contract", ContractSchema)
export default Contract

