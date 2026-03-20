import { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      approved: boolean;
      pendingLimitReached: boolean;
      isExistingUser: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    approved: boolean;
    pendingLimitReached?: boolean;
    isExistingUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    approved: boolean;
    pendingLimitReached?: boolean;
    isExistingUser?: boolean;
  }
}
