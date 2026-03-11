import { NextResponse } from "next/server";

import connectMongo from "@/lib/mongodb";
import { CarouselSnippetModel } from "@/lib/models";

export const revalidate = 0;

export async function GET() {
  try {
    await connectMongo();
    const snippets = await CarouselSnippetModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return NextResponse.json({ snippets });
  } catch {
    return NextResponse.json({ snippets: [] });
  }
}
