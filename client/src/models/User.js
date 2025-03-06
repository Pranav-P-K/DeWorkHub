import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For authentication
  role: { type: String, enum: ["Freelancer", "Company"], required: true },
  profilePicture: { type: String },
  bio: { type: String },
  skills: [{ type: String }], // Only for freelancers
  experience: { type: String },
  companyName: { type: String }, // Only for companies
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], // For companies
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // For freelancers
  walletAddress: { type: String }, // Web3 integration
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
