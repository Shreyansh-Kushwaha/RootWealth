import { NextRequest, NextResponse } from "next/server";
import { getFundHoldings, calculateOverlap } from "@/lib/mockHoldings";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fundA = body.fundA as string;
  const fundB = body.fundB as string;

  if (!fundA || !fundB) {
    return NextResponse.json({ error: "Two scheme codes are required." }, { status: 400 });
  }

  const holdingsA = getFundHoldings(fundA);
  const holdingsB = getFundHoldings(fundB);
  const result = calculateOverlap(holdingsA, holdingsB);
  return NextResponse.json(result);
}
