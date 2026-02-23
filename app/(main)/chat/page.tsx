"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { Send, Loader2, Camera, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history
  useEffect(() => {
    const loadHistory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .is("document_id", null)
        .order("created_at", { ascending: true })
        .limit(50);

      if (data) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            created_at: m.created_at,
          }))
        );
      }
      setInitialLoading(false);
    };

    loadHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to UI
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) throw new Error("Chat failed");
      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "すみません、エラーが発生しました。もう一度お試しください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white">
        <h1 className="text-lg font-bold text-foreground">
          AIに相談
        </h1>
        <p className="text-xs text-sub">
          書類のこと、お金のこと、なんでも聞いてください
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {initialLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                こんにちは！Fumulyです
              </p>
              <p className="text-sm text-sub mt-1 max-w-xs">
                書類の内容、期限の確認、手続きの方法など
                気になることを聞いてください
              </p>
            </div>
            <div className="space-y-2 w-full max-w-xs">
              {[
                "期限が近い書類はある？",
                "奨学金の猶予申請ってどうやるの？",
                "差押を受けたらどうすればいい？",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="w-full text-left text-sm text-primary bg-primary/5 rounded-xl px-4 py-2.5 hover:bg-primary/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <Link
              href="/scan"
              className="flex items-center gap-2 text-sm text-accent mt-2"
            >
              <Camera className="h-4 w-4" />
              書類を撮影して相談する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white border rounded-bl-md text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-sub/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-sub/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-sub/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-end gap-2 max-w-md mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 bg-primary hover:bg-primary/90 rounded-xl shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-ignore text-center mt-1.5">
          AIの回答は参考情報です。重要な判断は専門家にご相談ください。
        </p>
      </div>
    </div>
  );
}
