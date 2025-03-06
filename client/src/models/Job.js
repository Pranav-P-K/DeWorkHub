import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    requiredSkills: [{ type: String }],
    budget: { type: Number },
    status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    selectedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
export default Job;