import { NextRequest } from "next/server";
import User from "@/models/User";
import { connectMongo } from "@/lib/mongodb";
import { hashPassword, signToken, createSessionResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await connectMongo();

  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required." }), { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return new Response(JSON.stringify({ error: "Email is already in use." }), { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email: normalizedEmail, passwordHash });
  const token = signToken(user._id.toString());
  return createSessionResponse({ email: user.email }, token);
}
