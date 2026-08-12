import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendChat } from "../api/aiService";

const GREETING = {
  role: "assistant",
  content:
    "Hey there! I'm your IT assistant. Having trouble with your password, email, VPN, printer, or software? Tell me what's going on and I'll see if I can sort it out before you need to open a ticket. ",
  suggestsTicket: false,
};

export default function AssistantWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, sending, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const history = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChat(history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, suggestsTicket: res.suggestsTicket },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry \u2014 I couldn't reach the assistant just now. You can still open a ticket and an agent will help.",
          suggestsTicket: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => setMessages([GREETING]);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl bg-[#0C1426]/90 backdrop-blur-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="relative flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/8 shrink-0">
            <div className="absolute inset-x-0 bottom-0 neon-line opacity-40" />
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 border border-white/10 text-blue-300 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">IT Assistant</p>
                <p className="text-[11px] text-slate-400 leading-tight flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" style={{ color: "#34D399" }} />
                  Usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                title="New conversation"
                className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 premium-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-500/90 text-white rounded-br-sm shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)]"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                  {m.role === "assistant" && m.suggestsTicket && (
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/tickets/new");
                      }}
                      className="mt-2.5 block w-full text-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
                    >
                      Open a ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/8 bg-white/[0.02] shrink-0">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Describe your issue\u2026"
                className="flex-1 resize-none px-2 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none max-h-24 bg-transparent"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="w-8 h-8 rounded-lg bg-white text-[#0B1F3A] flex items-center justify-center hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-1.5">
              AI can make mistakes. Never share passwords.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        title="IT Assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_8px_30px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_8px_40px_-4px_rgba(59,130,246,0.8)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}