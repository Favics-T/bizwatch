import { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Send,
  Paperclip,
  ArrowLeft,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { sendChatMessage } from "../services/bizwatchApi.js";
import { chatHistory } from "../data/chat-history.js";
import { saveChat, loadChat } from "../services/chatStorage.js";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

// ─── Insight card styles ──────────────────────────────────────────────────────

const INSIGHT_STYLES = {
  opportunity: {
    wrapper: "bg-green-500/10 border-green-500/20",
    badge: "bg-green-500/20 text-green-400",
    dot: "bg-green-400",
  },
  risk: {
    wrapper: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-400",
    dot: "bg-amber-400",
  },
  warning: {
    wrapper: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-400",
    dot: "bg-red-400",
  },
  info: {
    wrapper: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-400",
    dot: "bg-blue-400",
  },
};

const DEFAULT_INSIGHT_STYLE = {
  wrapper: "bg-slate-500/10 border-slate-500/20",
  badge: "bg-slate-500/20 text-slate-400",
  dot: "bg-slate-400",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ insight }) {
  const s = INSIGHT_STYLES[insight.type] ?? DEFAULT_INSIGHT_STYLE;
  return (
    <div className={`rounded-xl border p-3 ${s.wrapper}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${s.badge}`}
        >
          {insight.type}
        </span>
      </div>
      <p className="text-xs font-semibold text-white mb-1 leading-snug">
        {insight.title}
      </p>
      <p className="text-xs text-slate-400 leading-relaxed">{insight.body}</p>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-sm rounded-2xl rounded-tr-sm bg-violet-600/80 px-4 py-3 text-sm text-white leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ content, insights, error }) {
  function handleCopy() {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        toast.success('Copied to clipboard')
      })
    }
  }

  return (
    <div className="flex items-start gap-3 group">
      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <BarChart2 size={14} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        {error ? (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-200 leading-relaxed space-y-3">
              {content.split("\n\n").map((para, i) => (
                <p key={i}>
                  {para.split("\n").map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
            {insights && insights.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
              >
                <Copy size={12} />
                Copy
              </button>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-500 hover:text-green-400 hover:bg-white/5 transition"
              >
                <ThumbsUp size={12} />
              </button>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition"
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-white/10 flex items-center justify-center shrink-0">
        <BarChart2 size={14} className="text-violet-400" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState("Chat");

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const createdAtRef = useRef(new Date().toISOString());

  useEffect(() => {
    // Revisiting a saved chat from localStorage
    const saved = loadChat(id);
    if (saved) {
      setChatTitle(saved.title);
      setMessages(saved.messages);
      createdAtRef.current = saved.createdAt;
      return;
    }

    // Revisiting a mock history chat
    const mockChat = chatHistory.find((c) => c.id === id);
    if (mockChat) {
      setChatTitle(mockChat.title);
      setMessages([
        {
          role: "assistant",
          content: `You're viewing "${mockChat.title}". ${mockChat.description} The last message in this thread: "${mockChat.lastMessage}"`,
          insights: [],
        },
      ]);
      return;
    }

    // Brand new chat — messages were already fetched in NewChat before navigating here
    const { initialMessages, chatTitle: title } = location.state ?? {};
    if (initialMessages?.length) {
      setChatTitle(
        title ?? initialMessages[0]?.content?.slice(0, 50) ?? "Chat",
      );
      setMessages(initialMessages);
    } else {
      navigate("/new-chat", { replace: true });
    }
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const result = await sendChatMessage(
        nextMessages
          .filter((m) => typeof m.content === "string" && m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content })),
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.response,
          insights: result.insights ?? [],
        },
      ]);
    } catch (err) {
      toast.error(err.message ?? 'Failed to get a response. Please try again.')
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: null,
          error: err.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  // Persist to localStorage whenever the conversation updates
  useEffect(() => {
    if (messages.length === 0) return;
    saveChat({
      id,
      title: chatTitle,
      messages,
      createdAt: createdAtRef.current,
    });
  }, [messages, chatTitle]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full overflow-hidden -mx-6 -my-6 sm:-mx-8 xl:-mx-10">
        {/* ── Chat header ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-3 px-6 sm:px-8 xl:px-10 py-4 border-b border-white/10 bg-[#0f0d17]">
          <button
            type="button"
            onClick={() => navigate("/new-chat")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-white/10 flex items-center justify-center shrink-0">
            <BarChart2 size={13} className="text-violet-400" />
          </div>
          <h2 className="text-sm font-medium text-white truncate">
            {chatTitle}
          </h2>
        </div>
     
      {/* ── Scrollable message thread ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-2xl mx-auto w-full px-6 sm:px-8 pt-8 pb-6 space-y-6">
          {messages.map((msg, i) =>
            msg.role === "user" ? (
              <UserMessage key={i} content={msg.content} />
            ) : (
              <AssistantMessage
                key={i}
                content={msg.content}
                insights={msg.insights}
                error={msg.error}
              />
            ),
          )}
          {loading && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/10 bg-[#0f0d17]">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1b162b] px-4 py-3 focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition">
            <button
              type="button"
              className="shrink-0 text-slate-500 hover:text-slate-300 transition pb-0.5"
            >
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              rows={1}
              disabled={loading}
              style={{ maxHeight: "10rem" }}
              className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed disabled:opacity-60"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10">⌘</kbd>
                ENTER
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-500 transition shadow-[0_4px_16px_-4px_rgba(124,58,237,0.6)]"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-2">
            BizWatch AI can make mistakes. Check important business info.
          </p>
        </div>
      </div>
    </div>
  );
}
