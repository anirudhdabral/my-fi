import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import connectMongo from "@/lib/mongodb";
import { CarouselSnippetModel } from "@/lib/models";

const snippetSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .trim()
    .min(1, "Snippet text is required")
    .max(150, "Snippet text can be at most 150 characters"),
});

const snippetListSchema = z.object({
  snippets: z.array(snippetSchema).max(30),
});

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();
    const snippets = await CarouselSnippetModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return NextResponse.json({ snippets });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin(req);
    const { snippets } = snippetListSchema.parse(await req.json());
    await connectMongo();

    const resultingIds: string[] = [];

    for (const [index, snippet] of snippets.entries()) {
      if (snippet.id) {
        await CarouselSnippetModel.findByIdAndUpdate(
          snippet.id,
          { text: snippet.text.trim(), order: index },
          { new: true },
        );
        resultingIds.push(snippet.id);
        continue;
      }

      const created = await CarouselSnippetModel.create({
        text: snippet.text.trim(),
        order: index,
      });
      resultingIds.push(created._id.toString());
    }

    if (resultingIds.length) {
      await CarouselSnippetModel.deleteMany({
        _id: { $nin: resultingIds },
      });
    } else {
      await CarouselSnippetModel.deleteMany({});
    }

    const snippetsResult = await CarouselSnippetModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return NextResponse.json({ snippets: snippetsResult });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
