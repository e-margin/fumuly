import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan, is_vip, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません" },
        { status: 404 }
      );
    }

    // VIPまたは無料ユーザーはSubscription情報不要
    if (profile.is_vip || profile.plan !== "paid" || !profile.stripe_subscription_id) {
      return NextResponse.json({
        plan: profile.plan,
        is_vip: profile.is_vip,
        plan_type: null,
      });
    }

    // Stripe APIからSubscription情報を取得
    const subscription = await getStripe().subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    // アクティブでないサブスクリプションはplan_type: nullを返す
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return NextResponse.json({
        plan: profile.plan,
        is_vip: profile.is_vip,
        plan_type: null,
      });
    }

    const priceId = subscription.items.data[0]?.price?.id;
    let planType: "monthly" | "yearly" | null = null;

    if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
      planType = "monthly";
    } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      planType = "yearly";
    }

    return NextResponse.json({
      plan: profile.plan,
      is_vip: profile.is_vip,
      plan_type: planType,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "サブスクリプション情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
