import mongoose from "mongoose";

const landingInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const LandingInquiry = mongoose.model("LandingInquiry", landingInquirySchema);
export default LandingInquiry;
