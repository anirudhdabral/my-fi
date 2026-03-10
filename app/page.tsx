import { getInvestmentMetadata } from "@/lib/data-service";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const metadata = await getInvestmentMetadata();

  return <HomeClient initialMetadata={metadata} />;
}
