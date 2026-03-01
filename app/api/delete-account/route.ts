import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Auth required (Cookie-based)
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // Cancel Stripe subscription if exists (before deleting profile)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Stripe subscription cancel error:", stripeError);
        // Continue with deletion even if Stripe cancel fails
      }
    }

    // Delete user data first (conversations, documents)
    const { error: convError } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("user_id", user.id);
    if (convError) {
      console.error("Failed to delete conversations:", convError);
      return NextResponse.json(
        { error: "データの削除に失敗しました" },
        { status: 500 }
      );
    }

    const { error: docError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("user_id", user.id);
    if (docError) {
      console.error("Failed to delete documents:", docError);
      return NextResponse.json(
        { error: "データの削除に失敗しました" },
        { status: 500 }
      );
    }

    // Delete auth user (CASCADE will also delete profiles row)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Delete account error:", error);
      return NextResponse.json(
        { error: "アカウントの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
