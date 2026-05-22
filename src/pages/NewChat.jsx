import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, TrendingUp, FileText, TrendingDown, Send, Paperclip, Loader2 } from 'lucide-react'
import { sendChatMessage } from '../services/bizwatchApi.js'

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

export default function NewChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const result = await sendChatMessage([{ role: 'user', content: text }])
      const chatId = `chat_${Date.now()}`
      const label = text.length > 50 ? text.slice(0, 50) + '…' : text
      const initialMessages = [
        { role: 'user', content: text },
        { role: 'assistant', content: result.response, insights: result.insights ?? [] },
      ]
      navigate(`/chat/${chatId}`, { state: { initialMessages, chatTitle: label } })
    } catch (err) {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function handleSuggestion(desc) {
    setInput(desc)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Hero + suggestions ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4 pb-6">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-[#1e1a2e] to-[#2a2044] border border-white/10 flex items-center justify-center shadow-[0_20px_60px_-20px_rgba(124,58,237,0.4)] mb-6">
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
                disabled={loading}
                className="group text-left rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-violet-400/30 hover:bg-white/7 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-40"
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
      </div>

      {/* ── Input bar — pinned to bottom ─────────────────────────────── */}
      <div className="shrink-0 border-t border-white/10 bg-[#0f0d17]">
        <div className="max-w-2xl mx-auto px-4 py-3">
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
              placeholder="Type your business inquiry..."
              rows={1}
              disabled={loading}
              style={{ maxHeight: '10rem' }}
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
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-2">
            BizWatch AI can make mistakes. Check important business info.
          </p>
        </div>
      </div>

    </div>
  )
}
