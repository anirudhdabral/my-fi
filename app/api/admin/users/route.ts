import { NextResponse } from "next/server";
import { z } from "zod";
import connectMongo from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

const userUpdateSchema = z.object({
  userId: z.string().min(1),
  approved: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}

import { sendUserApprovalEmail, sendUserRevokeEmail } from "@/lib/email";

export async function PATCH(req: Request) {
  try {
    await requireAdmin(req);
    const { userId, approved } = userUpdateSchema.parse(await req.json());
    await connectMongo();
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...(approved !== undefined ? { approved } : {}),
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (approved !== undefined) {
      if (approved) {
        await sendUserApprovalEmail(updated.email);
      } else {
        await sendUserRevokeEmail(updated.email);
      }
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
