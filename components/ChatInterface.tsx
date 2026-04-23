"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import type { ChatMessage } from "@/lib/types";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the **Enterprise RAG Assistant**. Upload your documents using the sidebar, then ask me anything about them.\n\nI'll retrieve the most relevant passages and provide grounded answers with source citations.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: ChatMessage = {
        id: data.response.id,
        role: "assistant",
        content: data.response.content,
        timestamp: new Date(data.response.timestamp),
        sources: data.response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, something went wrong while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="flex flex-col h-full" id="chat-interface">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1" id="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in">
            {/* Role label */}
            <div
              className={`flex items-center gap-2 mb-1.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-widest ${
                  msg.role === "user"
                    ? "text-violet-400"
                    : "text-emerald-400"
                }`}
              >
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
            </div>

            {/* Message bubble */}
            <div
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                    : "bg-white/[0.04] border border-white/[0.06] text-slate-200 shadow-lg shadow-black/10"
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatContent(msg.content),
                }}
              />
            </div>

            {/* Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 ml-1 flex flex-wrap gap-2">
                {msg.sources.map((source, idx) => (
                  <div
                    key={source.id || idx}
                    className="group relative flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[11px] text-slate-400 hover:bg-white/[0.06] hover:border-violet-500/30 transition-all cursor-default"
                  >
                    <svg
                      className="w-3 h-3 text-violet-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {source.metadata.filename}
                    </span>
                    {source.similarity && (
                      <span className="text-emerald-400/70 ml-1">
                        {Math.round(source.similarity * 100)}%
                      </span>
                    )}

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl bg-slate-900 border border-white/10 p-3 text-xs text-slate-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
                      <p className="line-clamp-4">{source.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-slate-500 ml-2">
                  Searching documents & generating response...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-4" id="chat-input-area">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            id="send-button"
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-violet-500/25"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          RAG-powered answers grounded in your uploaded documents · Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400 text-[10px]">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-slate-400 text-[10px]">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
