import { useState, useRef, useEffect } from 'react'
import { BarChart2, TrendingUp, FileText, TrendingDown, Send, Paperclip } from 'lucide-react'
import { sendChatMessage } from '../services/bizwatchApi.js'

// ─── Constants ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    title: 'Revenue Trends',
    desc: 'Analyze Q4 revenue trends across all regions and highlight anomalies.',
  },
  {
    icon: FileText,
    title: 'Market Reports',
    desc: 'Summarize the latest market reports regarding semiconductor logistics.',
  },
  {
    icon: TrendingDown,
    title: 'Predict Churn',
    desc: 'Predict churn for next month based on current user engagement metrics.',
  },
]

// Full class strings must be static literals so the Tailwind scanner picks them up.
const INSIGHT_STYLES = {
  opportunity: {
    wrapper: 'bg-green-500/10 border-green-500/20',
    badge: 'bg-green-500/20 text-green-400',
    dot: 'bg-green-400',
  },
  risk: {
    wrapper: 'bg-amber-500/10 border-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-400',
    dot: 'bg-amber-400',
  },
  warning: {
    wrapper: 'bg-red-500/10 border-red-500/20',
    badge: 'bg-red-500/20 text-red-400',
    dot: 'bg-red-400',
  },
  info: {
    wrapper: 'bg-blue-500/10 border-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-400',
    dot: 'bg-blue-400',
  },
}

const DEFAULT_INSIGHT_STYLE = {
  wrapper: 'bg-slate-500/10 border-slate-500/20',
  badge: 'bg-slate-500/20 text-slate-400',
  dot: 'bg-slate-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ insight }) {
  const s = INSIGHT_STYLES[insight.type] ?? DEFAULT_INSIGHT_STYLE
  return (
    <div className={`rounded-xl border p-3 ${s.wrapper}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${s.badge}`}>
          {insight.type}
        </span>
      </div>
      <p className="text-xs font-semibold text-white mb-1 leading-snug">{insight.title}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{insight.body}</p>
    </div>
  )
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-sm rounded-2xl rounded-tr-sm bg-violet-600/80 px-4 py-3 text-sm text-white leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function AssistantMessage({ content, insights, error }) {
  return (
    <div className="flex items-start gap-3">
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
            <p className="text-sm text-slate-200 leading-relaxed">{content}</p>
            {insights && insights.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
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
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  const hasMessages = messages.length > 0

  // Scroll to latest message whenever the thread updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const result = await sendChatMessage(
        nextMessages.map((m) => ({ role: m.role, content: m.content }))
      )
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          insights: result.insights ?? [],
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: null,
          error: err.message || 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSuggestion(desc) {
    setInput(desc)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Scrollable message area ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
      {!hasMessages ? (

        /* Empty state — vertically centred hero + suggestions */
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4 py-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1e1a2e] to-[#2a2044] border border-white/10 flex items-center justify-center shadow-[0_20px_60px_-20px_rgba(124,58,237,0.4)] mb-6">
            <BarChart2 size={36} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-3">
            How can I help with your business today?
          </h1>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed mb-10">
            Ask me to analyze data, summarize reports, or predict future market trends using your
            linked workspaces.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            {SUGGESTIONS.map(({ icon: Icon, title, desc }) => (
              <button
                key={title}
                type="button"
                onClick={() => handleSuggestion(desc)}
                className="group text-left rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-violet-400/30 hover:bg-white/7 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-violet-300 mb-3 group-hover:bg-violet-500/20 transition">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

      ) : (

        /* Chat thread */
        <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-6 space-y-6">
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserMessage key={i} content={msg.content} />
            ) : (
              <AssistantMessage
                key={i}
                content={msg.content}
                insights={msg.insights}
                error={msg.error}
              />
            )
          )}
          {loading && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>

      )}
      </div>

      {/* ── Input bar — pinned to bottom ─────────────────────────────── */}
      <div className="shrink-0 border-t border-white/10 bg-[#0f0d17]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#1b162b] px-4 py-3 focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition">
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
              onKeyDown={handleKeyDown}
              placeholder="Type your business inquiry..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed max-h-28 overflow-y-auto disabled:opacity-60 [field-sizing:content]"
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
          {!hasMessages && (
            <p className="text-center text-[11px] text-slate-600 mt-2">
              BizWatch AI can make mistakes. Check important business info.
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
