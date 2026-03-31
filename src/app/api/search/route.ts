import { NextRequest, NextResponse } from "next/server";
import { searchFunds } from "@/lib/mfapi";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  try {
    const funds = await searchFunds(query);
    return NextResponse.json(funds);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Unable to search funds." }, { status: 500 });
  }
}
