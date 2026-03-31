import { NextRequest } from "next/server";
import User from "@/models/User";
import { connectMongo } from "@/lib/mongodb";
import { verifyPassword, signToken, createSessionResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await connectMongo();

  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required." }), { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });
  }

  const token = signToken(user._id.toString());
  return createSessionResponse({ email: user.email }, token);
}
