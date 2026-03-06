import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { UserModel } from "@/lib/models";

const MAX_PENDING_USERS = 3;

export async function GET() {
  try {
    await connectMongo();
    const pendingUsers = await UserModel.countDocuments({
      approved: false,
      role: "user",
    });

    return NextResponse.json({
      paused: pendingUsers >= MAX_PENDING_USERS,
      pendingUsers,
      maxPendingUsers: MAX_PENDING_USERS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
