import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { UnitPlan } from '../../lib/types'
import { ResourceCard } from './ResourceCard'
import { Sparkles } from 'lucide-react'

interface ResourcesPanelProps {
  unit: UnitPlan
}

export function ResourcesPanel({ unit }: ResourcesPanelProps) {
  const allResources = unit.lessons.flatMap(lesson => 
    lesson.resources.map(resource => ({
      ...resource,
      lessonTitle: lesson.title
    }))
  )

  if (allResources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">No resources yet</h3>
          <p className="text-slate-500">Resources will appear here as you add lessons</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">All Resources</h2>
        <p className="text-sm text-slate-500">
          {allResources.length} resources across {unit.lessons.length} lessons
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allResources.map(resource => (
          <div key={resource.id}>
            <ResourceCard resource={resource} />
            <p className="text-xs text-slate-500 mt-1 px-1">From: {resource.lessonTitle}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
