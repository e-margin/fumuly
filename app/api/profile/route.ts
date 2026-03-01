import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { encrypt, decrypt } from "@/lib/encryption";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getAuthClient(req: NextRequest) {
  return createServerClient(
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
}

// GET: Fetch profile (with decryption)
export async function GET(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data } = await supabaseAdmin
      .from("profiles")
      .select("income_type, monthly_income, debt_total, has_adhd, phone_difficulty, current_situation, onboarding_done")
      .eq("id", user.id)
      .single();

    if (!data) {
      return NextResponse.json(null);
    }

    // Decrypt current_situation
    if (data.current_situation) {
      data.current_situation = decrypt(data.current_situation);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// PUT: Update profile (with encryption)
export async function PUT(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const updates = {
      income_type: body.income_type || null,
      monthly_income: body.monthly_income ?? null,
      debt_total: body.debt_total ?? null,
      has_adhd: body.has_adhd ?? false,
      phone_difficulty: body.phone_difficulty ?? false,
      current_situation: body.current_situation ? encrypt(body.current_situation) : null,
      onboarding_done: true,
    };

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
