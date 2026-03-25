import { unstable_cache } from "next/cache";
import connectMongo from "./mongodb";
import { InvestmentCategoryModel, InvestmentInstrumentModel } from "./models";

const fetchInvestmentMetadata = unstable_cache(
  async (latestTimestamp: string) => {
    console.log(`Cache miss: fetching metadata from DB (ver: ${latestTimestamp})`);
    await connectMongo();

    const [categories, instruments] = await Promise.all([
      InvestmentCategoryModel.find().lean(),
      InvestmentInstrumentModel.find().lean(),
    ]);

    // Handle MongoDB object serialization
    return JSON.parse(JSON.stringify({ categories, instruments }));
  },
  ["investment-metadata-stable"],
  { revalidate: 3600, tags: ["investment-metadata"] },
);

export async function getInvestmentMetadata() {
  await connectMongo();

  // Fast check: get the latest update from either collection
  const [lastCat, lastInst] = await Promise.all([
    InvestmentCategoryModel.findOne({}, { updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .lean(),
    InvestmentInstrumentModel.findOne({}, { updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const latestCatTs = (lastCat as any)?.updatedAt?.getTime() ?? 0;
  const latestInstTs = (lastInst as any)?.updatedAt?.getTime() ?? 0;
  const combinedTimestamp = Math.max(latestCatTs, latestInstTs);

  return fetchInvestmentMetadata(combinedTimestamp.toString());
}
