import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import AppLayout from "../components/AppLayout";
import { sendChat } from "../api/aiService";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm your IT self-service assistant. Describe the issue you're having — " +
    "password, email, VPN, printer, software — and I'll try to help before you open a ticket.",
  suggestsTicket: false,
};

export default function Assistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

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
        {
          role: "assistant",
          content: res.reply,
          suggestsTicket: res.suggestsTicket,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the assistant just now. You can still open a ticket and an agent will help.",
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

  return (
    <AppLayout
      title="IT Assistant"
      subtitle="Get quick help, or open a ticket if you need a technician"
    >
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-13rem)]">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#0B1F3A] text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                }`}
              >
                {m.content}
                {m.role === "assistant" && m.suggestsTicket && (
                  <button
                    onClick={() => navigate("/tickets/new")}
                    className="mt-3 block w-full text-center px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Open a ticket
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-end gap-2 bg-white rounded-xl border border-slate-200 p-2">
            <textarea
              className="flex-1 resize-none px-2 py-1.5 text-sm text-slate-800 focus:outline-none max-h-32"
              rows={1}
              placeholder="Describe your issue…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="px-4 py-2 bg-[#0B1F3A] text-white text-sm font-medium rounded-lg hover:bg-[#12294d] disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            AI can make mistakes. Never share passwords.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}