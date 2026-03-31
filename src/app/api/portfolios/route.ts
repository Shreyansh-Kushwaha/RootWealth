import { NextRequest, NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";
import { simulatePortfolio } from "@/lib/simulation";
import type { PortfolioCreatePayload, PortfolioDocument } from "@/types";

function serializeDocument(doc: PortfolioDocument) {
  return {
    ...doc,
    _id: doc._id,
    startDate: new Date(doc.startDate).toISOString(),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function GET() {
  await connectMongo();
  const portfolios = await Portfolio.find({}).sort({ startDate: -1 }).lean();
  const results = await Promise.all(
    portfolios.map(async (portfolio) => {
      const simulation = await simulatePortfolio(portfolio as PortfolioCreatePayload);
      return { ...serializeDocument(portfolio as PortfolioDocument), simulation };
    })
  );
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  await connectMongo();
  const body = (await request.json()) as PortfolioCreatePayload;

  if (!body.fundName || !body.schemeCode || !body.investmentType || !body.amount || !body.startDate) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (body.investmentType === "SIP" && (!body.sipDate || body.sipDate < 1 || body.sipDate > 31)) {
    return NextResponse.json({ error: "SIP date must be between 1 and 31." }, { status: 400 });
  }

  try {
    const portfolio = await Portfolio.create({
      fundName: body.fundName,
      schemeCode: body.schemeCode,
      investmentType: body.investmentType,
      amount: body.amount,
      sipDate: body.sipDate,
      startDate: new Date(body.startDate),
      isActive: true,
    });
    return NextResponse.json(portfolio, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create portfolio." }, { status: 500 });
  }
}
