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
    <div className="flex flex-col h-full bg-transparent" id="chat-interface">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" id="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fade-in">
            {/* Role label */}
            <div
              className={`flex items-center gap-2 mb-1.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`text-[10px] font-mono uppercase tracking-widest ${
                  msg.role === "user"
                    ? "text-onyx-400"
                    : "text-champagne drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
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
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-[13px] leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-onyx-700/80 border border-onyx-600/50 text-onyx-100"
                    : "bg-onyx-800/40 border border-onyx-700/50 text-onyx-200"
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatContent(msg.content),
                }}
              />
            </div>

            {/* Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2.5 ml-1 flex flex-wrap gap-2">
                {msg.sources.map((source, idx) => (
                  <div
                    key={source.id || idx}
                    className="group relative flex items-center gap-1.5 rounded-full bg-onyx-800/60 border border-onyx-700 px-3 py-1.5 text-[10px] font-mono text-onyx-400 hover:bg-onyx-800 hover:border-onyx-500 hover:text-onyx-200 transition-all cursor-default shadow-sm"
                  >
                    <svg
                      className="w-3 h-3 text-champagne/70 group-hover:text-champagne transition-colors"
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
                    <span className="tracking-wide">
                      {source.metadata.filename}
                    </span>
                    {source.similarity && (
                      <span className="text-onyx-500 ml-1">
                        [{Math.round(source.similarity * 100)}%]
                      </span>
                    )}

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl bg-onyx-800 border border-onyx-600 p-3 text-[11px] text-onyx-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
                      <p className="line-clamp-4 leading-relaxed font-sans">{source.content}</p>
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
            <div className="bg-onyx-800/40 border border-onyx-700/50 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-onyx-500">
                  Synthesizing
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 pb-6" id="chat-input-area">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-onyx-700 to-onyx-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              disabled={isLoading}
              className="relative w-full resize-none rounded-2xl border border-onyx-600 bg-onyx-800/90 px-5 py-3.5 pr-12 text-[13px] text-onyx-100 placeholder-onyx-500 focus:outline-none focus:ring-1 focus:ring-champagne/50 focus:border-champagne/50 transition-all disabled:opacity-50 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            id="send-button"
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-onyx-700 border border-onyx-600 text-onyx-200 shadow-md hover:bg-onyx-600 hover:text-champagne active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-onyx-700 disabled:hover:text-onyx-200 disabled:active:scale-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-onyx-500 mt-3 font-mono tracking-wide">
          RAG-POWERED · <kbd className="px-1.5 py-0.5 rounded bg-onyx-800 border border-onyx-700 text-onyx-400">ENTER</kbd> TO SEND
        </p>
      </div>
    </div>
  );
}
