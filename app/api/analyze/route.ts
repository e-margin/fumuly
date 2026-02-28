import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeDocument } from "@/lib/claude";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const authHeader = req.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") ||
      req.cookies.get("sb-access-token")?.value;

    // Get user from supabase auth (use anon key for client-side calls)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Get user context from profile for better analysis
    let userContext = "";
    if (token) {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const parts: string[] = [];
          if (profile.income_type)
            parts.push(`収入種別: ${profile.income_type}`);
          if (profile.monthly_income)
            parts.push(`月収: ${profile.monthly_income}万円`);
          if (profile.debt_total)
            parts.push(`借金総額: ${profile.debt_total}万円`);
          if (profile.has_adhd) parts.push("後回しにしがち（先延ばし・書類放置の傾向）");
          if (profile.phone_difficulty) parts.push("電話が苦手");
          if (profile.current_situation)
            parts.push(`現在の状況: ${profile.current_situation}`);

          if (parts.length > 0) {
            userContext = `【ユーザー情報】\n${parts.join("\n")}`;
          }
        }
      }
    }

    const result = await analyzeDocument(image, userContext || undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
