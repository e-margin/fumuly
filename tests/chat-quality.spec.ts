import { test, expect, Page } from "@playwright/test";

const EMAIL = "test@fumuly.app";
const PASSWORD = "test1234";

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.waitForSelector('input[name="email"]', { timeout: 10_000 });
  await page.waitForTimeout(1_000); // wait for React hydration

  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });
}

async function sendMessage(page: Page, message: string): Promise<string> {
  const textarea = page.locator("textarea");
  await textarea.fill(message);
  await page.click('button:has(svg.lucide-send)');

  // wait for loading dots to appear then disappear
  await page.waitForSelector(".animate-bounce", { timeout: 10_000 }).catch(() => {});
  await page.waitForSelector(".animate-bounce", { state: "detached", timeout: 60_000 });

  // get the last assistant message
  const assistantMessages = page.locator("div.bg-white.border.rounded-2xl");
  const lastMessage = assistantMessages.last();
  await expect(lastMessage).toBeVisible({ timeout: 5_000 });
  return (await lastMessage.textContent()) || "";
}

test.describe("Chat quality tests", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/chat", { waitUntil: "networkidle" });
    await page.waitForSelector("textarea", { timeout: 10_000 });
  });

  test("chat page loads correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "AIに相談" })).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.locator('button:has(svg.lucide-send)')).toBeVisible();
    const emptyState = page.locator("text=こんにちは！Fumulyです");
    const messages = page.locator("div.bg-white.border.rounded-2xl");
    const hasContent =
      (await emptyState.isVisible().catch(() => false)) || (await messages.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test("send message and receive response", async ({ page }) => {
    const reply = await sendMessage(page, "こんにちは");
    expect(reply.length).toBeGreaterThan(0);
    expect(reply).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/);
  });

  test("deadline question returns relevant response", async ({ page }) => {
    const reply = await sendMessage(page, "期限が近い書類はある？");
    expect(reply.length).toBeGreaterThan(10);
    const relevant = /期限|書類|ありません|見つかり|登録|確認|まだ|ない/.test(reply);
    expect(relevant).toBeTruthy();
  });

  test("action advice question returns actionable response", async ({ page }) => {
    const reply = await sendMessage(page, "届いた書類にどう対応すればいい？");
    expect(reply.length).toBeGreaterThan(10);
    const suggestsCall = /電話してください|電話をかけて|電話で問い合わせ/.test(reply);
    expect(suggestsCall).toBeFalsy();
  });

  test("tone is warm and supportive", async ({ page }) => {
    const reply = await sendMessage(page, "差押予告通知が届いたんだけど怖い");
    console.log("Supportive reply:", reply);
    expect(reply.length).toBeGreaterThan(20);
    const coldPatterns = /知りません|わかりません|対応できません|自分でやって/;
    expect(coldPatterns.test(reply)).toBeFalsy();
    // Broader check: should contain actionable or empathetic content
    const supportive = /大丈夫|安心|まず|落ち着|一緒|対応|方法|手続|相談|窓口|確認|心配|不安|焦|慌|整理|ステップ|順|行動|連絡|猶予|分割|減額|支払/.test(reply);
    expect(supportive).toBeTruthy();
  });

  test("handles rapid messages gracefully", async ({ page }) => {
    const reply1 = await sendMessage(page, "テスト1");
    expect(reply1.length).toBeGreaterThan(0);
    const reply2 = await sendMessage(page, "テスト2");
    expect(reply2.length).toBeGreaterThan(0);
  });
});
