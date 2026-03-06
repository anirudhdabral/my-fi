import connectMongo from "../mongodb";
import {
  InvestmentCategoryModel,
  InvestmentInstrumentModel,
  type InvestmentCategoryDocument,
  type InvestmentInstrumentDocument,
} from "../models";

export interface Allocation {
  instrumentId: string;
  categoryId: string;
  allocatedAmount: number;
}

export async function calculateAllocations(
  amount: number,
  categoryIds?: string[],
): Promise<Allocation[]> {
  if (amount <= 0) {
    throw new Error("Allocation amount must be greater than zero");
  }

  await connectMongo();

  let categories = (await InvestmentCategoryModel.find().lean()) as any[];

  if (!categories.length) {
    throw new Error("No investment categories are configured");
  }

  // Filter categories if categoryIds is provided
  if (categoryIds && categoryIds.length > 0) {
    categories = categories.filter((c) =>
      categoryIds.includes((c._id as any).toString()),
    );
    if (!categories.length) {
      throw new Error("None of the selected categories were found");
    }

    // Rescale percentages to 100% for selected categories
    const selectionTotal = categories.reduce((sum, c) => sum + c.percentage, 0);
    categories = categories.map((c) => ({
      ...c,
      percentage: (c.percentage / selectionTotal) * 100,
    }));
  } else {
    // Validate total is 100% for the full set
    const totalCategoryPercentage = categories.reduce(
      (sum, category) => sum + category.percentage,
      0,
    );
    if (Math.abs(totalCategoryPercentage - 100) > 0.01) {
      throw new Error("Categories must sum to 100%");
    }
  }

  const instruments =
    await InvestmentInstrumentModel.find().lean<
      InvestmentInstrumentDocument[]
    >();
  const allocations: Allocation[] = [];

  const instrumentsByCategory = instruments.reduce<
    Record<string, InvestmentInstrumentDocument[]>
  >((acc, instrument) => {
    const key = instrument.categoryId.toString();
    acc[key] = acc[key] ? [...acc[key], instrument] : [instrument];
    return acc;
  }, {});

  for (const category of categories) {
    const categoryAmount = (amount * category.percentage) / 100;
    const categoryKey = category._id.toString();
    const categoryInstruments = instrumentsByCategory[categoryKey] ?? [];

    if (!categoryInstruments.length) {
      continue;
    }

    const categoryInstrumentTotal = categoryInstruments.reduce(
      (sum, instrument) => sum + instrument.inv_percentage,
      0,
    );

    if (Math.abs(categoryInstrumentTotal - 100) > 0.01) {
      throw new Error(`Instruments for "${category.name}" must total 100%`);
    }

    for (const instrument of categoryInstruments) {
      allocations.push({
        instrumentId: instrument._id.toString(),
        categoryId: categoryKey,
        allocatedAmount: Number(
          ((categoryAmount * instrument.inv_percentage) / 100).toFixed(2),
        ),
      });
    }
  }

  return allocations;
}
