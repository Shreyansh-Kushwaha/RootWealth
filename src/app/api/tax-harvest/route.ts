import { NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getTaxHarvestRecommendation } from "@/lib/taxHarvest";

export async function GET() {
  await connectMongo();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const portfolios = await Portfolio.find({ isActive: true, userId: user.id }).lean();
    const recommendation = await getTaxHarvestRecommendation(portfolios);
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Tax harvest recommendation error:", error);
    return NextResponse.json({ error: "Unable to calculate tax harvest recommendation." }, { status: 500 });
  }
}
