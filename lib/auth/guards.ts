import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";

async function getJwt(req: Request | NextRequest): Promise<JWT | null> {
  return getToken({
    req: req as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export async function requireAdmin(req: Request) {
  const token = await getJwt(req);

  if (!token || token.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return token;
}

export async function requireSession(req: Request) {
  const token = await getJwt(req);

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}
