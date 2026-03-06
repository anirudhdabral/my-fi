import { NextResponse } from "next/server";
import { z } from "zod";
import connectMongo from "@/lib/mongodb";
import {
  InvestmentInstrumentModel,
  InvestmentCategoryModel,
} from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";

const instrumentSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  categoryId: z.string().min(1),
  inv_percentage: z.coerce.number().min(0).max(100),
});

const instrumentListSchema = z.object({
  instruments: z.array(instrumentSchema).min(0),
});

const validateInstrumentPercentages = (
  instruments: z.infer<typeof instrumentSchema>[],
) => {
  const grouped = instruments.reduce<Record<string, number>>(
    (acc, instrument) => {
      const key = instrument.categoryId;
      acc[key] = (acc[key] ?? 0) + instrument.inv_percentage;
      return acc;
    },
    {},
  );

  for (const [categoryId, total] of Object.entries(grouped)) {
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(
        `Instrument percentages for category ${categoryId} must equal 100`,
      );
    }
  }
};

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();
    const instruments = await InvestmentInstrumentModel.find().lean();
    return NextResponse.json({ instruments });
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
    const { instruments } = instrumentListSchema.parse(await req.json());
    validateInstrumentPercentages(instruments);
    await connectMongo();

    // ensure referenced categories exist
    const categories = await InvestmentCategoryModel.find().lean();
    const validCategoryIds = new Set(
      categories.map((category) => category._id.toString()),
    );

    const invalidCategory = instruments.find(
      (instrument) => !validCategoryIds.has(instrument.categoryId),
    );

    if (invalidCategory) {
      throw new Error(`Category ${invalidCategory.categoryId} was not found`);
    }

    const resultingIds: string[] = [];

    for (const instrument of instruments) {
      if (instrument.id) {
        await InvestmentInstrumentModel.findByIdAndUpdate(
          instrument.id,
          {
            type: instrument.type,
            categoryId: instrument.categoryId,
            inv_percentage: instrument.inv_percentage,
          },
          { new: true },
        );
        resultingIds.push(instrument.id);
        continue;
      }

      const created = await InvestmentInstrumentModel.create({
        type: instrument.type,
        categoryId: instrument.categoryId,
        inv_percentage: instrument.inv_percentage,
      });
      resultingIds.push(created._id.toString());
    }

    if (resultingIds.length) {
      await InvestmentInstrumentModel.deleteMany({
        _id: { $nin: resultingIds },
      });
    } else {
      await InvestmentInstrumentModel.deleteMany({});
    }

    const instrumentsResult = await InvestmentInstrumentModel.find().lean();
    return NextResponse.json({ instruments: instrumentsResult });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
