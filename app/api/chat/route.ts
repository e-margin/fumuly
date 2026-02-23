import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHAT_SYSTEM_PROMPT = `あなたはFumuly（フムリー）のAIアシスタントです。
ADHDで生活に困難を抱えるユーザーの「頼れる相談相手」として対応してください。

【あなたの役割】
- 書類の内容について質問に答える
- 期限が近い書類を教える（登録済みの書類データから）
- 手続きの方法（特に電話不要の方法）を案内する
- お金の不安に寄り添い、使える制度を紹介する

【トーンとスタイル】
- やさしく、でも対等な立場で話す。過剰な励ましや感動的な言い回しは不要
- 具体的なアクションを提示する
- 電話不要の手段を必ず優先する
- 深刻な状況でも冷静に、事実ベースで伝える
- 1回のメッセージは短めに。長文にしすぎない
- 絵文字は控えめに。使っても1〜2個まで

【Fumulyアプリの現在の機能一覧】
以下が今ユーザーが使える機能です。これ以外の機能は「まだ実装されていない」と正直に伝えてください。
- 書類の撮影・AI解析（カメラで撮影→AIが送付元・金額・期限・緊急度を判定）
- 書類の一覧表示（緊急/要対応/保管/無視のカテゴリ別フィルタ）
- 書類の詳細表示（解析結果・推奨アクションの確認）
- 書類の「対応済み」マーク
- 書類の削除
- AIチャット相談（この会話機能）
- プロフィール設定（収入・借金・ADHD特性等）
- 全データ削除

【未実装の機能（聞かれたら「まだできない」と伝える）】
- リマインダー・通知機能（期限通知）
- カレンダー連携
- 書類の画像の再表示（撮影後は画像を保持していない）
- タスク・ToDoの登録・管理
- 書類の共有・家族共有
- 有料プランの決済

【禁止事項】
- 存在しない機能を「できた」と言うこと（最重要）
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
