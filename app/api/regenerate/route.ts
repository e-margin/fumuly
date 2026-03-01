import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { regenerateSummary } from "@/lib/claude";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Auth required
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

    const body = await req.json();
    const { sender, type, amount, deadline, category } = body;

    if (!sender || !type || !category) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // Get user context from profile
    let userContext = "";
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      const profileData: Record<string, string> = {};
      if (profile.income_type) profileData["収入種別"] = profile.income_type;
      if (profile.monthly_income) profileData["月収（万円）"] = String(profile.monthly_income);
      if (profile.debt_total) profileData["借金総額（万円）"] = String(profile.debt_total);
      if (profile.has_adhd) profileData["特性"] = "後回しにしがち";
      if (profile.phone_difficulty) profileData["電話"] = "苦手";

      if (Object.keys(profileData).length > 0) {
        userContext = `<user_profile>\n${JSON.stringify(profileData, null, 2)}\n</user_profile>`;
      }
    }

    const result = await regenerateSummary(
      { sender, type, amount, deadline, category },
      userContext || undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: "サマリーの再生成に失敗しました" },
      { status: 500 }
    );
  }
}
