import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: { type: String },
});

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;