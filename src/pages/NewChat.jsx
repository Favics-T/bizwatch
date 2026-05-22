import { useState, useRef } from 'react'
import { BarChart2, TrendingUp, FileText, TrendingDown, Send, Paperclip } from 'lucide-react'

const suggestions = [
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

function handleSend() {
  if (!input.trim()) return;

  console.log(input);

  // future:
  // send message to API

  setInput('');
}

export default function NewChat() {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  function handleSuggestion(desc) {
    setInput(desc)
    textareaRef.current?.focus()
  }

  function handleSend() {
  if (!input.trim()) return;

  console.log(input);

  // future:
  // send message to API

  setInput('');
}

  function handleKeyDown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSend();
  }
}

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 py-12">
      {/* Branding */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1e1a2e] to-[#2a2044] border border-white/10 flex items-center justify-center shadow-[0_20px_60px_-20px_rgba(124,58,237,0.4)]">
          <BarChart2 size={36} className="text-violet-400" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            How can I help with your business today?
          </h1>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Ask me to analyze data, summarize reports, or predict future market trends using your
            linked workspaces.
          </p>
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10">
        {suggestions.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            type="button"
            onClick={() => handleSuggestion(desc)}
            className="group text-left rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition cursor-pointer hover:border-violet-400/30 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-violet-300 mb-3 group-hover:bg-violet-500/20 transition">
              <Icon size={18} />
            </div>
            <p className="text-sm font-semibold text-white mb-1">{title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {/* Chat input */}
      <div className="w-full max-w-2xl">
        <div className="relative flex items-end gap-3 rounded-2xl border border-white/10 bg-[#1b162b] px-4 py-3 focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition">
          <button
            type="button"
            className="shrink-0 text-slate-500 hover:text-slate-300 transition cursor-pointer pb-0.5"
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
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">⌘</kbd>
              <span>ENTER</span>
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-500 transition cursor-pointer shadow-[0_4px_16px_-4px_rgba(124,58,237,0.6)]"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-600 mt-3">
          BizWatch AI can make mistakes. Check important business info.
        </p>
      </div>
    </div>
  )
}
