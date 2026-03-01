import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findProfileByCustomerId(customerId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error("checkout.session.completed: missing supabase_user_id in metadata", session.id);
          break;
        }
        if (!session.subscription) {
          console.error("checkout.session.completed: missing subscription", session.id);
          break;
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: "paid",
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update plan on checkout:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const profile = await findProfileByCustomerId(customerId);

        if (!profile) {
          console.error("subscription.updated: profile not found for customer", customerId);
          break;
        }

        const plan = subscription.status === "active" ? "paid" : "free";
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            stripe_subscription_id: subscription.id,
          })
          .eq("id", profile.id);

        if (error) {
          console.error("Failed to update plan on subscription.updated:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const profile = await findProfileByCustomerId(customerId);

        if (!profile) {
          console.error("subscription.deleted: profile not found for customer", customerId);
          break;
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
          })
          .eq("id", profile.id);

        if (error) {
          console.error("Failed to update plan on subscription.deleted:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error("Payment failed for customer:", invoice.customer);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
