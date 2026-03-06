import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();

    const pendingUsers = await UserModel.countDocuments({
      approved: false,
      role: "user",
    });

    return NextResponse.json({ pendingUsers });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
