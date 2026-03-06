import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import {
  InvestmentCategoryModel,
  InvestmentInstrumentModel,
} from "@/lib/models";

export async function GET() {
  await connectMongo();
  const [categories, instruments] = await Promise.all([
    InvestmentCategoryModel.find().lean(),
    InvestmentInstrumentModel.find().lean(),
  ]);

  return NextResponse.json({ categories, instruments });
}
