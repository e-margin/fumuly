---
id: task-017
title: スキャン画像のフロントエンドリサイズ処理
parents: [機能]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: 送信前に画像を長辺1568pxにリサイズ。解析精度に影響なし
estimated_hours: 2
---

## 概要
現在のスキャン機能はスマホカメラの元画像（3-5MB）をそのままBase64でAPIに送信している。
フロントエンドでCanvas APIを使い、長辺1568pxにリサイズしてから送信する。

## なぜ1568pxか
Claude Vision APIは内部で長辺1568pxに自動縮小して解析するため、
事前にリサイズしても解析精度は一切変わらない。
A4書類の細かい文字も1568pxあれば十分に読み取れる。

## メリット
- 転送時間の大幅短縮（3-5MB → 300-500KB）
- Claude APIのトークンコスト削減
- Vercel移行時の4.5MBボディ制限に対応（task-009）
- 複数枚撮影（task-013）でも余裕を持てる（10枚でも約4MB以下）

## 実装案

### リサイズユーティリティ関数
`lib/image.ts` に作成:
```typescript
export async function resizeImage(
  dataUrl: string,
  maxSize: number = 1568
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      // JPEG quality 0.85 で十分な画質を維持
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}
```

### scan/page.tsx の変更
`handleCapture` 内でリサイズ関数を呼び出し、リサイズ後のdataUrlをプレビューとBase64に設定する。
