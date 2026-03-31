import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema(
  {
    fundName: { type: String, required: true },
    schemeCode: { type: String, required: true },
    investmentType: { type: String, required: true, enum: ["SIP", "LUMPSUM"] },
    amount: { type: Number, required: true, min: 1 },
    sipDate: { type: Number, min: 1, max: 31 },
    startDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", PortfolioSchema);
export default Portfolio;
