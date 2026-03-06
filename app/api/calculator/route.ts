import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateAllocations } from "@/lib/services/allocation";

const calculationSchema = z.object({
  amount: z.coerce.number().positive(),
  categoryIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const { amount, categoryIds } = calculationSchema.parse(await req.json());
    const allocations = await calculateAllocations(amount, categoryIds);
    return NextResponse.json({ allocations });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
