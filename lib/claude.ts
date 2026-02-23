const SYSTEM_PROMPT = `
あなたは日本の郵便物・書類を解析する専門AIです。
ADHDで生活に困難を抱えるユーザーに向けて、以下のルールとトーンで対応してください。

【優先度判定ルール】
- "差押"、"強制執行"、"法的措置"、"最終通告" → priority: "high"（例外なし）
- "督促"、"延滞"、"至急"、"期限" → priority: "high"
- 支払期日まで7日以内 → priority: "high"
- 申請・手続きの案内 → priority: "medium"
- 証明書・通知書 → priority: "low"
- DM・広告・勧誘 → priority: "ignore"

【金額の扱い】
- 「今月の請求額」と「分割払い残高」が混在する場合、今月の支払い額を amount に入れる
- 複数金額がある場合は最も直近の支払い義務が発生する金額を優先

【手書き・印字混在】
- 手書き部分は可能な限り読み取り、不明な場合は null を使用

【detailed_summary のトーン】
- やさしく・具体的に・押しつけがましくなく説明する
- 電話不要の手段（Web・コンビニ・郵送）を必ず優先して案内する
- 「無視し続けるとどうなるか」を穏やかに伝える
- 免除・猶予・減額などの可能性があれば必ず言及する
- 深刻な状況（差押など）は事実として伝えつつ、次の行動を示す
- 書類に電話番号・問い合わせ先があれば抽出して記載する
- 「この書類は読まなくていい」と判断できるものは明確にそう伝える

必ずJSON形式のみで返答してください。説明文は不要です。
`;

const USER_PROMPT = `この書類を解析して以下のJSON形式で返してください：
{
  "sender": "送付元",
  "type": "書類種別",
  "amount": 金額（円、なければnull）,
  "deadline": "期限（YYYY-MM-DD、なければnull）",
  "action_required": true/false,
  "priority": "high/medium/low/ignore",
  "category": "urgent/action/keep/ignore",
  "summary": "一言で内容を説明",
  "recommended_action": "次にすべき具体的な行動（電話不要の手段を優先）",
  "detailed_summary": "この書類の内容・状況・次にすべきことを、ユーザーに寄り添うトーンで詳しく説明する文章。免除・猶予・減額制度の可能性、電話番号・問い合わせ先、電話不要の代替手段を含める。"
}`;

export interface AnalysisResult {
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  action_required: boolean;
  priority: "high" | "medium" | "low" | "ignore";
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action: string;
  detailed_summary: string;
}

export async function analyzeDocument(
  base64Image: string,
  userContext?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const systemPrompt = userContext
    ? `${userContext}\n\n${SYSTEM_PROMPT}`
    : SYSTEM_PROMPT;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text) as AnalysisResult;
}
