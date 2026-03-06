import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";
import connectMongo from "@/lib/mongodb";
import { UserModel } from "@/lib/models";

async function getJwt(req: Request | NextRequest): Promise<JWT | null> {
  return getToken({
    req: req as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

async function getCurrentUser(token: JWT) {
  if (!token.email) {
    return null;
  }

  await connectMongo();
  return UserModel.findOne({ email: token.email.toLowerCase() }).lean();
}

export async function requireAdmin(req: Request) {
  const token = await getJwt(req);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const currentUser = await getCurrentUser(token);

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  token.role = currentUser.role;
  token.approved = currentUser.approved;
  token.id = currentUser._id.toString();
  return token;
}

export async function requireSession(req: Request) {
  const token = await getJwt(req);
  if (!token) {
    throw new Error("Authentication required");
  }

  const currentUser = await getCurrentUser(token);

  if (!currentUser) {
    throw new Error("Authentication required");
  }

  token.role = currentUser.role;
  token.approved = currentUser.approved;
  token.id = currentUser._id.toString();
  return token;
}
