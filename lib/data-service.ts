import { unstable_cache } from "next/cache";
import connectMongo from "./mongodb";
import { InvestmentCategoryModel, InvestmentInstrumentModel } from "./models";

export const getInvestmentMetadata = unstable_cache(
  async () => {
    console.log("Fetching investment metadata from DB...");
    await connectMongo();

    const [categories, instruments] = await Promise.all([
      InvestmentCategoryModel.find().lean(),
      InvestmentInstrumentModel.find().lean(),
    ]);

    // Serialize MongoDB objects
    return JSON.parse(JSON.stringify({ categories, instruments }));
  },
  ["investment-metadata"],
  { revalidate: 3600, tags: ["investment-metadata"] },
);
