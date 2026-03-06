import { NextResponse } from "next/server";
import { z } from "zod";
import connectMongo from "@/lib/mongodb";
import { InvestmentCategoryModel } from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  percentage: z.coerce.number().min(1).max(100),
});

const categoryListSchema = z.object({
  categories: z.array(categorySchema).min(1),
});

const validatePercentages = (categories: { percentage: number }[]) => {
  const total = categories.reduce(
    (sum, category) => sum + category.percentage,
    0,
  );
  if (Math.abs(total - 100) > 0.01) {
    throw new Error("Total category percentages must equal 100");
  }
};

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();
    const categories = await InvestmentCategoryModel.find()
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ categories });
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
    const { categories } = categoryListSchema.parse(await req.json());
    validatePercentages(categories);
    await connectMongo();
    const resultingIds: string[] = [];

    for (const category of categories) {
      if (category.id) {
        await InvestmentCategoryModel.findByIdAndUpdate(
          category.id,
          {
            name: category.name,
            percentage: category.percentage,
          },
          { new: true },
        );
        resultingIds.push(category.id);
        continue;
      }

      const created = await InvestmentCategoryModel.create({
        name: category.name,
        percentage: category.percentage,
      });
      resultingIds.push(created._id.toString());
    }

    if (resultingIds.length) {
      await InvestmentCategoryModel.deleteMany({
        _id: { $nin: resultingIds },
      });
    }

    const categoriesResult = await InvestmentCategoryModel.find()
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ categories: categoriesResult });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
