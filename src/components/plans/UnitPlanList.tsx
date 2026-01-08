import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { BookOpen, Calendar, Trash2, FileText } from 'lucide-react'
import { UnitPlan } from '../../lib/types'
import { format } from 'date-fns'

interface UnitPlanListProps {
  units: UnitPlan[]
  onSelectUnit: (unitId: string) => void
  onDeleteUnit: (unitId: string) => void
}

export function UnitPlanList({ units, onSelectUnit, onDeleteUnit }: UnitPlanListProps) {
  if (units.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Unit Plans Yet</h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Create your first unit plan to get started. AI will help you generate lessons, resources, and standards alignment.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map(unit => (
        <Card 
          key={unit.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onSelectUnit(unit.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-2 mb-2">{unit.title}</CardTitle>
                <CardDescription className="line-clamp-1">{unit.subject} • {unit.gradeLevel}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this unit plan?')) {
                    onDeleteUnit(unit.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(unit.startDate), 'MMM d')} - {format(new Date(unit.endDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{unit.lessons.length} lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{unit.standards.length} standards</span>
              </div>
            </div>

            {unit.standards.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {unit.standards.slice(0, 3).map(standard => (
                  <Badge key={standard.id} variant="secondary" className="text-xs">
                    {standard.code}
                  </Badge>
                ))}
                {unit.standards.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{unit.standards.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
