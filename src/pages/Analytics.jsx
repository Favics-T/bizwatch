import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useEngines } from '../hooks/useEngines.js'
import AlertPanel from '../components/AlertPanel.jsx'
import InsightPanel from '../components/InsightPanel.jsx'
import PredictionPanel from '../components/PredictionPanel.jsx'
import ConnectionStatus from '../components/ConnectionStatus.jsx'
import { RefreshCw, TrendingUp, Lightbulb, Bell, BarChart2 } from 'lucide-react'
import { timeAgo } from '../lib/utils.js'

function StatCard({ icon: Icon, label, value, badge, color = '#7C3AED' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {badge && (
          <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-mono">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuth()
  const businessType = localStorage.getItem('bizwatch_business_type') ?? 'general'
  const { data, loading, error, lastUpdated, analyse } = useEngines(businessType)

  useEffect(() => {
    analyse()
  }, [analyse])

  const insightCount = data?.insights?.insights?.length ?? 0
  const alertCount = data?.alerts?.unread_count ?? 0
  const predCount = data?.predictions?.predictions?.length ?? 0
  const connectedCount = data?.connectedSources
    ? Object.values(data.connectedSources).filter(Boolean).length
    : 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-6 px-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Overview — real-time business intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-500 hidden sm:block">{timeAgo(lastUpdated)}</span>
          )}
          <button
            type="button"
            onClick={analyse}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh All
          </button>
        </div>
      </div>

      {/* Connection status bar */}
      <ConnectionStatus
        sources={data?.connectedSources}
        lastUpdated={lastUpdated}
        onRefresh={analyse}
        loading={loading}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart2}
          label="Connected sources"
          value={connectedCount}
          badge="All time"
          color="#7C3AED"
        />
        <StatCard
          icon={Lightbulb}
          label="Insights found"
          value={loading ? '—' : insightCount}
          badge={insightCount > 0 ? `Today ↑ ${insightCount}` : undefined}
          color="#4A9EFF"
        />
        <StatCard
          icon={Bell}
          label="Active alerts"
          value={loading ? '—' : alertCount}
          color="#FF4757"
        />
        <StatCard
          icon={TrendingUp}
          label="Predictions"
          value={loading ? '—' : predCount}
          color="#00E87A"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Three-column panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
          <InsightPanel insights={data?.insights} loading={loading} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
          <PredictionPanel predictions={data?.predictions} loading={loading} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
          <AlertPanel alerts={data?.alerts} loading={loading} />
        </div>
      </div>
    </div>
  )
}
