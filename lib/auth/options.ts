import { UserModel } from "@/lib/models";
import connectMongo from "@/lib/mongodb";
import { UserRole } from "@/lib/models/User";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials must be set");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be configured");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        return false;
      }

      await connectMongo();
      const normalizedEmail = user.email.toLowerCase().trim();
      const isAdmin = adminEmail
        ? normalizedEmail === adminEmail.trim()
        : false;
      const existing = await UserModel.findOne({ email: normalizedEmail });

      await UserModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          name: user.name,
          role: isAdmin ? "admin" : (existing?.role ?? "user"),
          approved: isAdmin ? true : (existing?.approved ?? false),
        },
        { upsert: true, new: true },
      );

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        await connectMongo();
        const dbUser = await UserModel.findOne({
          email: user.email.toLowerCase(),
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.approved = dbUser.approved;
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: (token.role ?? "user") as UserRole,
          approved: Boolean(token.approved),
        },
      };
    },
  },
};
