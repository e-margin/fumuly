import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

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

// PATCH: Update email or password
export async function PATCH(req: NextRequest) {
  try {
    const supabaseClient = getAuthClient(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "update_email") {
      const { email } = body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email });
      if (error) {
        console.error("Email update error:", error);
        return NextResponse.json({ error: "メールアドレスの変更に失敗しました" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "update_password") {
      const { password } = body;
      if (!password || typeof password !== "string" || password.length < 6) {
        return NextResponse.json({ error: "パスワードは6文字以上で入力してください" }, { status: 400 });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
      if (error) {
        console.error("Password update error:", error);
        return NextResponse.json({ error: "パスワードの変更に失敗しました" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "不正なアクションです" }, { status: 400 });
  } catch (error) {
    console.error("Account PATCH error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
