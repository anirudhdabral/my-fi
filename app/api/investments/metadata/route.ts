import { NextResponse } from "next/server";
import { getInvestmentMetadata } from "@/lib/data-service";

export const revalidate = 0; // Disable route caching, use data-service for smart cache check

export async function GET() {
  const metadata = await getInvestmentMetadata();
  return NextResponse.json(metadata);
}
