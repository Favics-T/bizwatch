import React from 'react'
  import SectionHeader from '../components/ui/SectionHeader'
import SourceCard from '../components/Knowledgebase/SourceCard'
import CustomKnowledgeCard from '../components/Knowledgebase/CustomKnowledgeCard'
import { sources } from '../data/data';
import { customSources } from '../data/data';
import { Workflow } from 'lucide-react';



export default function Knowledgebase() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 xl:px-10">
      <SectionHeader
        title="Knowledgebase"
        description="Build a central source of truth for your team by syncing knowledge from every system and document library."
      />

      <h1 className='flex gap-2  items-center'> <span><Workflow /></span> Connected Sources</h1>

    

      <div className="grid gap-6 md:grid-cols-3">
        {sources.map((source) => (
          <SourceCard key={source.title} {...source} />
        ))}
      </div>

      <h1><span></span> Custom Knowledge</h1>

      <div className="grid gap-6 lg:grid-cols-4">
        {customSources.map((source) => (
          <CustomKnowledgeCard key={source.title} {...source} />
        ))}
      </div>
    </div>
  )
}
