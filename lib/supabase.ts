import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        const cookies: { name: string; value: string }[] = [];
        document.cookie.split(";").forEach((cookie) => {
          const [name, ...rest] = cookie.split("=");
          if (name.trim()) {
            try {
              cookies.push({
                name: decodeURIComponent(name.trim()),
                value: decodeURIComponent(rest.join("=").trim()),
              });
            } catch {
              cookies.push({
                name: name.trim(),
                value: rest.join("=").trim(),
              });
            }
          }
        });
        return cookies;
      },
      setAll(cookies) {
        if (typeof document === "undefined") return;
        cookies.forEach(({ name, value, options }) => {
          const maxAge = options?.maxAge ?? 86400 * 7; // 7 days
          const expires = new Date(Date.now() + maxAge * 1000);
          let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
          cookieStr += `; path=${options?.path ?? "/"}`;
          cookieStr += `; expires=${expires.toUTCString()}`;
          cookieStr += `; SameSite=${options?.sameSite ?? "Lax"}`;
          if (options?.secure || location.protocol === "https:") {
            cookieStr += "; Secure";
          }
          document.cookie = cookieStr;
        });
      },
    },
  }
);
