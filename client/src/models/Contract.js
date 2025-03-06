import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    escrowAmount: { type: Number, required: true },
    status: { type: String, enum: ['ongoing', 'completed', 'disputed'], default: 'ongoing' },
}, { timestamps: true });

const Contract = mongoose.models.Contract || mongoose.model("Contract", ContractSchema);
export default Contract;