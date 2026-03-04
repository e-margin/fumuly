import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:support@fumuly.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// POST: 期限到来リマインダーをPush通知で送信（Cronジョブから呼ばれる）
export async function POST(req: NextRequest) {
  // Vercel CronのAuthorizationヘッダーで認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // 現在時刻以前かつ未送信のリマインダーを取得（最大50件）
    const { data: reminders, error: remError } = await supabaseAdmin
      .from("reminders")
      .select(`
        id, user_id, document_id, remind_at,
        documents!inner(sender, type, deadline)
      `)
      .eq("is_sent", false)
      .lte("remind_at", now.toISOString())
      .order("remind_at", { ascending: true })
      .limit(50);

    if (remError) {
      console.error("Reminder fetch error:", remError);
      return NextResponse.json({ error: "リマインダー取得エラー" }, { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ sent: 0, message: "送信対象なし" });
    }

    // 全ユーザーのSubscriptionを一括取得（N+1回避）
    const userIds = [...new Set(reminders.map((r) => r.user_id))];
    const { data: allSubs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("user_id, endpoint, keys_p256dh, keys_auth")
      .in("user_id", userIds);

    const subsByUser = new Map<string, typeof allSubs>();
    for (const sub of allSubs || []) {
      if (!subsByUser.has(sub.user_id)) subsByUser.set(sub.user_id, []);
      subsByUser.get(sub.user_id)!.push(sub);
    }

    let sentSubscriptions = 0;
    let failedSubscriptions = 0;
    const processedReminderIds: string[] = [];

    for (const reminder of reminders) {
      processedReminderIds.push(reminder.id);

      const subs = subsByUser.get(reminder.user_id);
      if (!subs || subs.length === 0) continue;

      const doc = reminder.documents as unknown as { sender: string; type: string; deadline: string | null };
      const payload = JSON.stringify({
        title: `📄 ${doc.sender}`,
        body: `${doc.type}の期限${doc.deadline ? `（${doc.deadline}）` : ""}が近づいています`,
        url: `/documents/${reminder.document_id}`,
        tag: `reminder-${reminder.id}`,
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth,
              },
            },
            payload
          );
          sentSubscriptions++;
        } catch (pushError: unknown) {
          const statusCode = (pushError as { statusCode?: number })?.statusCode;
          if (statusCode === 410 || statusCode === 404) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
          failedSubscriptions++;
        }
      }
    }

    // 処理済みリマインダーを一括更新
    if (processedReminderIds.length > 0) {
      await supabaseAdmin
        .from("reminders")
        .update({ is_sent: true })
        .in("id", processedReminderIds);
    }

    return NextResponse.json({
      sentSubscriptions,
      failedSubscriptions,
      reminders: reminders.length,
    });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
