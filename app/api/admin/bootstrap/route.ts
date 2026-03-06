import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import {
  InvestmentCategoryModel,
  InvestmentInstrumentModel,
  UserModel,
} from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();

    const [categories, instruments, users] = await Promise.all([
      InvestmentCategoryModel.find().sort({ name: 1 }).lean(),
      InvestmentInstrumentModel.find().lean(),
      UserModel.find().sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ categories, instruments, users });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
