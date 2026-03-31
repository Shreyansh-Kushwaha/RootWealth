import { NextRequest, NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";

export async function GET(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  await connectMongo();
  const { id } = await context.params;
  const portfolio = await Portfolio.findById(id).lean();
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  return NextResponse.json(portfolio);
}

export async function DELETE(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  await connectMongo();
  const { id } = await context.params;
  const deleted = await Portfolio.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
