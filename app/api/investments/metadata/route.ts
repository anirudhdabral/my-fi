import { NextResponse } from "next/server";
import { getInvestmentMetadata } from "@/lib/data-service";

export const revalidate = 3600; // Cache the response for 1 hour

export async function GET() {
  const metadata = await getInvestmentMetadata();
  return NextResponse.json(metadata);
}
