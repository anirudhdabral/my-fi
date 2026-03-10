import connectMongo from "@/lib/mongodb";
import {
  InvestmentCategoryModel,
  InvestmentInstrumentModel,
} from "@/lib/models";
import HomeClient from "./HomeClient";

async function getMetadata() {
  try {
    await connectMongo();
    const [categories, instruments] = await Promise.all([
      InvestmentCategoryModel.find().lean(),
      InvestmentInstrumentModel.find().lean(),
    ]);

    // Serialize MongoDB objects for Client Component
    return JSON.parse(JSON.stringify({ categories, instruments }));
  } catch (error) {
    console.error("Error fetching metadata on server:", error);
    return null;
  }
}

export default async function HomePage() {
  const metadata = await getMetadata();

  return <HomeClient initialMetadata={metadata} />;
}
