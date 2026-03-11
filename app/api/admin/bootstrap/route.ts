import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import {
  CarouselSnippetModel,
  InvestmentCategoryModel,
  InvestmentInstrumentModel,
  UserModel,
} from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();

    const [categories, instruments, users, snippets] = await Promise.all([
      InvestmentCategoryModel.find().sort({ name: 1 }).lean(),
      InvestmentInstrumentModel.find().lean(),
      UserModel.find().sort({ createdAt: -1 }).lean(),
      CarouselSnippetModel.find().sort({ order: 1, createdAt: 1 }).lean(),
    ]);

    return NextResponse.json({ categories, instruments, users, snippets });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
