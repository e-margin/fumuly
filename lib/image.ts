/**
 * 画像をCanvas APIで長辺maxSizepxにリサイズし、JPEG base64 dataURLを返す。
 * Claude Vision APIは内部で長辺1568pxに縮小するため、事前リサイズで転送量とコストを削減。
 */
export function resizeImage(
  dataUrl: string,
  maxSize: number = 1568
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // リサイズ不要ならそのまま返す
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}
