import { NextResponse } from "next/server";

// Stripe Payment Links — no SDK needed, just redirect
// These are pre-configured Stripe payment links
const STRIPE_MONTHLY_LINK = process.env.STRIPE_MONTHLY_LINK || "https://buy.stripe.com/test_00g00000000000";
const STRIPE_YEARLY_LINK = process.env.STRIPE_YEARLY_LINK || "https://buy.stripe.com/test_00g00000000001";

export async function POST(req: Request) {
  try {
    const { plan, userId } = await req.json();

    const link = plan === "yearly" ? STRIPE_YEARLY_LINK : STRIPE_MONTHLY_LINK;

    // Append client_reference_id so Stripe webhook can identify the user
    const url = new URL(link);
    if (userId) {
      url.searchParams.set("client_reference_id", userId);
    }

    return NextResponse.json({ url: url.toString() });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
