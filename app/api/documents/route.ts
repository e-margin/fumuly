import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { encrypt, decrypt, encryptFields, decryptFields } from "@/lib/encryption";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTED_DOC_FIELDS = ["summary", "detailed_summary", "recommended_action"] as const;

function getUser(req: NextRequest) {
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

// GET: Fetch documents (with decryption)
export async function GET(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "home" | "all" | null
    const id = searchParams.get("id"); // single document

    if (id) {
      // Single document
      const { data } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!data) {
        return NextResponse.json({ error: "見つかりません" }, { status: 404 });
      }

      const decrypted = decryptFields(data, [...ENCRYPTED_DOC_FIELDS]);
      return NextResponse.json(decrypted);
    }

    if (mode === "home") {
      // Home: urgent/action, not done, limit 10
      const { data } = await supabaseAdmin
        .from("documents")
        .select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done")
        .eq("user_id", user.id)
        .eq("is_done", false)
        .in("category", ["urgent", "action"])
        .order("deadline", { ascending: true, nullsFirst: false })
        .limit(10);

      const docs = (data || []).map((d) => decryptFields(d, ["summary", "recommended_action"]));
      return NextResponse.json(docs);
    }

    // All documents
    const { data } = await supabaseAdmin
      .from("documents")
      .select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const docs = (data || []).map((d) => decryptFields(d, ["summary", "recommended_action"]));
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// POST: Save new document (with encryption)
export async function POST(req: NextRequest) {
  try {
    const supabaseClient = getUser(req);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const doc = {
      user_id: user.id,
      sender: body.sender,
      type: body.type,
      amount: body.amount,
      deadline: body.deadline,
      action_required: body.action_required,
      priority: body.priority,
      category: body.category,
      summary: body.summary,
      recommended_action: body.recommended_action,
      detailed_summary: body.detailed_summary,
    };

    const encrypted = encryptFields(doc, [...ENCRYPTED_DOC_FIELDS]);
    const { error } = await supabaseAdmin.from("documents").insert(encrypted);

    if (error) {
      console.error("Document save error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
