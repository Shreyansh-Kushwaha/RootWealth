import { NextRequest, NextResponse } from "next/server";
import { fetchNavHistory } from "@/lib/mfapi";

export async function GET(request: NextRequest) {
  const schemeCode = request.nextUrl.searchParams.get("schemeCode");
  if (!schemeCode) {
    return NextResponse.json({ error: "schemeCode is required." }, { status: 400 });
  }

  try {
    const history = await fetchNavHistory(schemeCode);
    return NextResponse.json({ schemeCode, history });
  } catch (error) {
    console.error("Fund history API error:", error);
    return NextResponse.json({ error: "Unable to fetch fund history." }, { status: 500 });
  }
}
