import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ['applied', 'reviewed', 'hired', 'rejected'], default: 'applied' },
});

const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
export default Application;