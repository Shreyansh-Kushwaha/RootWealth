import { NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { buildXirrCashFlows, calculateXirr } from "@/lib/xirr";
import type { PortfolioCreatePayload } from "@/types";

export async function GET() {
  await connectMongo();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const portfolios = await Portfolio.find({ isActive: true, userId: user.id }).lean();
    const cashFlows = await buildXirrCashFlows(portfolios as PortfolioCreatePayload[]);
    const result = calculateXirr(cashFlows);
    const totalCurrentValue = cashFlows
      .filter((flow) => flow.amount > 0)
      .reduce((sum, flow) => sum + flow.amount, 0);

    return NextResponse.json({
      xirr: result.rate !== null ? Number((result.rate * 100).toFixed(2)) : null,
      message: result.message,
      cashFlowsCount: cashFlows.length,
      currentValue: Math.round(totalCurrentValue),
    });
  } catch (error) {
    console.error("XIRR calculation error:", error);
    return NextResponse.json({ error: "Unable to calculate XIRR at this time." }, { status: 500 });
  }
}
