import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHAT_SYSTEM_PROMPT = `あなたはFumuly（フムリー）のAIアシスタントです。
ADHDで生活に困難を抱えるユーザーの「家族のような存在」として寄り添ってください。

【あなたの役割】
- 書類の内容について質問に答える
- 期限が近い書類を教える
- 手続きの方法（特に電話不要の方法）を案内する
- お金の不安に寄り添い、使える制度を紹介する
- ユーザーの小さな行動を肯定する

【トーンとスタイル】
- やさしく、押しつけがましくなく
- 具体的なアクションを提示する
- 電話不要の手段を必ず優先する
- 深刻な状況でも冷静に、でも共感を持って
- 「大丈夫」「できる」という安心感を与える
- 1回のメッセージは短めに。長文にしすぎない

【禁止事項】
- 法的助言（「弁護士に相談してください」は可）
- 医療的助言
- 金融商品の推薦
- ユーザーを責めるような言葉

【免責】
AIの回答は参考情報であり、専門家の助言に代わるものではありません。`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get auth token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    let userId: string | null = null;
    let userContext = "";
    let recentDocuments = "";
    let conversationHistory: { role: string; content: string }[] = [];

    if (token) {
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const {
        data: { user },
      } = await supabaseClient.auth.getUser(token);

      if (user) {
        userId = user.id;

        // Get profile for context
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
          if (profile.has_adhd) parts.push("ADHD傾向あり");
          if (profile.phone_difficulty) parts.push("電話が苦手");
          if (profile.current_situation)
            parts.push(`現在の状況: ${profile.current_situation}`);

          if (parts.length > 0) {
            userContext = `\n\n【ユーザー情報】\n${parts.join("\n")}`;
          }
        }

        // Get recent documents for context
        const { data: docs } = await supabaseAdmin
          .from("documents")
          .select("sender, type, amount, deadline, category, summary, is_done")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (docs && docs.length > 0) {
          recentDocuments = `\n\n【登録済みの書類】\n${docs
            .map(
              (d) =>
                `- ${d.sender}（${d.type}）${d.amount ? `¥${d.amount}` : ""}${d.deadline ? ` 期限:${d.deadline}` : ""} [${d.category}]${d.is_done ? " ✓対応済み" : ""}`
            )
            .join("\n")}`;
        }

        // Get conversation history
        const { data: history } = await supabaseAdmin
          .from("conversations")
          .select("role, content")
          .eq("user_id", user.id)
          .is("document_id", null)
          .order("created_at", { ascending: true })
          .limit(20);

        if (history) {
          conversationHistory = history.map((h) => ({
            role: h.role,
            content: h.content,
          }));
        }
      }
    }

    // Build messages
    const messages = [
      ...conversationHistory.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        system: CHAT_SYSTEM_PROMPT + userContext + recentDocuments,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content[0].text;

    // Save conversation to DB
    if (userId) {
      await supabaseAdmin.from("conversations").insert([
        { user_id: userId, role: "user", content: message },
        { user_id: userId, role: "assistant", content: reply },
      ]);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
