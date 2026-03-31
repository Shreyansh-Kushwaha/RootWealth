import { NextRequest, NextResponse } from "next/server";
import Portfolio from "@/models/Portfolio";
import { connectMongo } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  await connectMongo();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const portfolio = await Portfolio.findOne({ _id: id, userId: user.id }).lean();
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  return NextResponse.json(portfolio);
}

export async function DELETE(request: NextRequest, context: { params: { id: string } | Promise<{ id: string }> }) {
  await connectMongo();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await Portfolio.findOneAndDelete({ _id: id, userId: user.id }).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
