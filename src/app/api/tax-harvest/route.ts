import { NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";
import { getTaxHarvestRecommendation } from "@/lib/taxHarvest";

export async function GET() {
  await connectMongo();

  try {
    const portfolios = await Portfolio.find({ isActive: true }).lean();
    const recommendation = await getTaxHarvestRecommendation(portfolios);
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Tax harvest recommendation error:", error);
    return NextResponse.json({ error: "Unable to calculate tax harvest recommendation." }, { status: 500 });
  }
}
