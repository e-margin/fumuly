const SYSTEM_PROMPT = `
あなたは日本の郵便物・書類を解析する専門AIです。
書類や手続きを後回しにしがちなユーザーに向けて、以下のルールとトーンで対応してください。

【優先度判定ルール】
- "差押"、"強制執行"、"法的措置"、"最終通告" → priority: "high"（例外なし）
- "督促"、"延滞"、"至急"、"期限" → priority: "high"
- 支払期日まで7日以内 → priority: "high"
- 申請・手続きの案内 → priority: "medium"
- 証明書・通知書 → priority: "low"
- DM・広告・勧誘 → priority: "ignore"

【金額の扱い — 最重要ルール】
- amount には「今回ユーザーが実際に振り込む・支払う合計金額」だけを入れる
- 払込取扱票の金額の読み取り方：
  1. まず用紙の上部にある「¥」マークの右側、または「金額」と書かれたマス目欄（1桁ずつ区切られた数字枠）を探す
  2. このマス目欄に印字されている数字が振込総額（amount）である
  3. 明細欄・内訳欄に書かれている個別の数字（元金、利息、延滞金、督促手続費、割賦金など）は内訳であり、amount にしてはならない
  4. 「前回入金額」「前回金額」は過去の支払い記録であり、今回の振込金額ではない
- 以下は amount に入れてはならない：借用金額、残元金、貸付残高、前回入金額、前回振込額、延滞据置利息残高、内訳の個別金額
- 「今月の請求額」と「分割払い残高」が混在する場合、今月の支払い額を amount に入れる

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

【書類以外の画像への対応】
送信された画像が書類・郵便物でない場合（自撮り、風景写真、スクリーンショット、イラストなど）は、解析を行わず以下のJSONを返してください：
{
  "error": "not_a_document",
  "sender": "不明",
  "type": "書類ではありません",
  "amount": null,
  "deadline": null,
  "action_required": false,
  "priority": "ignore",
  "category": "ignore",
  "summary": "書類として認識できませんでした",
  "recommended_action": "封筒の中身やハガキなど、書類を撮影してください",
  "detailed_summary": "この画像は書類として認識できませんでした。Fumulyでは郵便物や書類の写真を解析します。封筒の中身やハガキ、通知書などを撮影してお試しください。"
}

必ずJSON形式のみで返答してください。説明文は不要です。
`;

const USER_PROMPT = `この画像を確認してください。書類・郵便物であれば解析して以下のJSON形式で返してください。書類でない場合はシステムプロンプトの【書類以外の画像への対応】に従ってください。

{
  "sender": "送付元",
  "type": "書類種別",
  "amount": 金額（円、なければnull）,
  "amount_candidates": [画像内で読み取れた全ての金額を数値の配列で返す。重複除外、降順。例: [115918, 16750, 15116]],
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
  amount_candidates: number[];
  deadline: string | null;
  action_required: boolean;
  priority: "high" | "medium" | "low" | "ignore";
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action: string;
  detailed_summary: string;
}

export async function analyzeDocument(
  base64Images: string | string[],
  userContext?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const images = Array.isArray(base64Images) ? base64Images : [base64Images];

  // userContext is already sanitized with XML tags by the caller
  let systemPrompt = userContext
    ? `${SYSTEM_PROMPT}\n\n${userContext}`
    : SYSTEM_PROMPT;

  if (images.length > 1) {
    systemPrompt += "\n\n【複数画像】\n送信された複数の画像は同一書類の別ページ・裏表です。すべてを総合して1つの書類として解析してください。";
  }

  const imageContent = images.map((data) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: "image/jpeg" as const,
      data,
    },
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
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
    const status = response.status;
    if (status === 529 || status === 503) {
      throw new Error(`Claude API overloaded: ${status}`);
    }
    throw new Error(`Claude API error: ${status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  // Claude sometimes wraps JSON in ```json ... ``` markdown blocks
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  let result: AnalysisResult;
  try {
    result = JSON.parse(cleaned) as AnalysisResult;
  } catch {
    console.error("JSON parse failed. Raw response:", text);
    throw new Error("解析結果の読み取りに失敗しました。もう一度お試しください");
  }
  // フォールバック: amount_candidatesが返されなかった場合
  if (!Array.isArray(result.amount_candidates)) {
    result.amount_candidates = result.amount != null ? [result.amount] : [];
  }
  // 重複除外
  result.amount_candidates = [...new Set(result.amount_candidates)];
  return result;
}

export interface RegenerateInput {
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
}

export interface RegenerateResult {
  summary: string;
  recommended_action: string;
  detailed_summary: string;
}

export async function regenerateSummary(
  input: RegenerateInput,
  userContext?: string
): Promise<RegenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const systemPrompt = `あなたは日本の郵便物・書類の内容を要約するAIです。
ユーザーが書類の解析結果の金額を修正しました。修正後の金額を正として、サマリーと推奨アクションを再生成してください。

【トーン】
- やさしく・具体的に・押しつけがましくなく
- 電話不要の手段（Web・コンビニ・郵送）を優先して案内
- 免除・猶予・減額の可能性があれば言及

${userContext || ""}

JSON形式のみで返答してください。`;

  const prompt = `以下の書類情報をもとに、summary・recommended_action・detailed_summaryを生成してください。

<document_info>
送付元: ${input.sender}
種別: ${input.type}
金額: ${input.amount != null ? `¥${input.amount.toLocaleString()}` : "なし"}
期限: ${input.deadline || "なし"}
カテゴリ: ${input.category}
</document_info>

{
  "summary": "一言で内容を説明",
  "recommended_action": "次にすべき具体的な行動",
  "detailed_summary": "詳しい説明（寄り添うトーン）"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 529 || status === 503) {
      throw new Error(`Claude API overloaded: ${status}`);
    }
    throw new Error(`Claude API error: ${status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as RegenerateResult;
  } catch {
    console.error("JSON parse failed. Raw response:", text);
    throw new Error("再生成結果の読み取りに失敗しました。もう一度お試しください");
  }
}
