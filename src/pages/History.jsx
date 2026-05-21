import { useMemo, useState } from 'react'
import { Activity, Briefcase, FileText, Lightbulb, MessageSquare } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'
import HistorySearch from '../components/history/HistorySearch'
import HistorySection from '../components/history/HistorySection'

const historyGroups = [
  {
    title: 'Today',
    items: [
      {
        id: 'q3-growth',
        icon: <Activity size={22} />,
        iconColor: 'bg-violet-500',
        title: 'Q3 Market Growth Projections',
        subtitle: 'Read on the recent dataset, the projected growth for the retail sector shows a 12% increase.',
        time: '11:40 AM',
      },
      {
        id: 'swot-analysis',
        icon: <Lightbulb size={22} />,
        iconColor: 'bg-fuchsia-500',
        title: 'Competition SWOT Analysis',
        subtitle: 'Summarize the main threats identified in the competitive landscape report for Brand X.',
        time: '09:15 AM',
      },
    ],
  },
  {
    title: 'Yesterday',
    items: [
      {
        id: 'roadmap-ideas',
        icon: <Briefcase size={22} />,
        iconColor: 'bg-sky-500',
        title: 'Product Roadmap Ideas',
        subtitle: 'Let’s explore new product features for the enterprise dashboard expansion plan.',
        time: 'Yesterday',
      },
    ],
  },
  {
    title: 'Last Days',
    items: [
      {
        id: 'api-debug',
        icon: <FileText size={22} />,
        iconColor: 'bg-emerald-500',
        title: 'API Integration Debugging',
        subtitle: 'Fixing a 403 Forbidden error when attempting to fetch the latest analytics stream.',
        time: 'Oct 24',
      },
      {
        id: 'user-persona',
        icon: <MessageSquare size={22} />,
        iconColor: 'bg-amber-500',
        title: 'User Persona Development',
        subtitle: 'Define three primary user personas for a FinTech platform targeting Gen Z investors.',
        time: 'Oct 21',
      },
    ],
  },
]

export default function History() {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(
    () =>
      historyGroups.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase()),
        ),
      })),
    [query],
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-0 py-6 sm:px-0 xl:px-0">
      <SectionHeader
        title="History"
        description="Search past conversations and jump back into the most important insights from your AI workspace."
        action={
          <Button variant="secondary" size="lg" className="hidden sm:inline-flex">
            Export
          </Button>
        }
      />

      <Card className="space-y-6">
        <HistorySearch value={query} onChange={(event) => setQuery(event.target.value)} onFilter={() => null} />

        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <HistorySection key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </Card>
    </div>
  )
}
