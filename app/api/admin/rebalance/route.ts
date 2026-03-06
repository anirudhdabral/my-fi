import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { requireAdmin } from "@/lib/auth/guards";
import { sendRebalanceEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    await connectMongo();

    const users = await UserModel.find({ approved: true }).lean();

    const recipients = users.map((user) => user.email);
    if (!recipients.length) {
      return NextResponse.json({ message: "No subscribed users to notify" });
    }

    const html = `
      <h1>Portfolio Rebalance Required</h1>
      <p>The latest investment allocation targets for your portfolio are now available in your cockpit.</p>
      <p>Please log in to your account and rebalance your investments to stay aligned with your targets.</p>
      <br />
      <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Check Targets Now</a>
    `;

    const text = `Portfolio rebalance reminder. The latest targets are ready. Please log in to ${process.env.NEXTAUTH_URL} to view and rebalance your portfolio.`;

    await sendRebalanceEmail(recipients, html, text);

    return NextResponse.json({ message: "Rebalance emails queued" });
  } catch (error) {
    const status = (error as Error).message.includes("Unauthorized")
      ? 401
      : 400;
    return NextResponse.json({ error: (error as Error).message }, { status });
  }
}
