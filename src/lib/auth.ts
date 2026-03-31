import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongo } from "@/lib/mongodb";

const SESSION_COOKIE_NAME = "session";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "30d";

function getSecret() {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return JWT_SECRET;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getSecret()) as { sub: string };
  } catch {
    return null;
  }
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload?.sub) {
    return null;
  }

  await connectMongo();
  const user = await User.findById(payload.sub).lean();
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
  };
}

export function createSessionResponse(data: unknown, token: string) {
  const response = NextResponse.json(data);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function clearSessionResponse(data: unknown) {
  const response = NextResponse.json(data);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  return response;
}
