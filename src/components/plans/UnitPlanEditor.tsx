import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Calendar,
  FileText,
  Lightbulb,
  Sparkles,
  Clock
} from 'lucide-react'
import { UnitPlan, Lesson } from '../../lib/types'
import { LessonEditor } from './LessonEditor'
import { AddLessonDialog } from './AddLessonDialog'
import { ResourcesPanel } from './ResourcesPanel'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface UnitPlanEditorProps {
  unit: UnitPlan
  onUpdate: (unit: UnitPlan) => void
  onBack: () => void
}

export function UnitPlanEditor({ unit, onUpdate, onBack }: UnitPlanEditorProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('lessons')

  const selectedLesson = unit.lessons.find(l => l.id === selectedLessonId)

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const updatedUnit = {
      ...unit,
      lessons: unit.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l),
      updatedAt: new Date().toISOString()
    }
    onUpdate(updatedUnit)
  }

  const handleAddLesson = (newLesson: Lesson) => {
    const updatedUnit = {
      ...unit,
      lessons: [...unit.lessons, newLesson],
      updatedAt: new Date().toISOString()
    }
    onUpdate(updatedUnit)
    setIsAddLessonOpen(false)
    toast.success('Lesson added successfully')
  }

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      const updatedUnit = {
        ...unit,
        lessons: unit.lessons.filter(l => l.id !== lessonId),
        updatedAt: new Date().toISOString()
      }
      onUpdate(updatedUnit)
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
      }
      toast.success('Lesson deleted')
    }
  }

  const handleExportPDF = () => {
    toast.info('PDF export feature coming soon!')
  }

  if (selectedLesson) {
    return (
      <LessonEditor
        lesson={selectedLesson}
        unitSubject={unit.subject}
        onUpdate={handleUpdateLesson}
        onBack={() => setSelectedLessonId(null)}
        onDelete={() => handleDeleteLesson(selectedLesson.id)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{unit.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-medium">{unit.subject}</span>
              <span>•</span>
              <span>{unit.gradeLevel}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(unit.startDate), 'MMM d')} - {format(new Date(unit.endDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {unit.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-700">{unit.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Standards */}
      {unit.standards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aligned Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unit.standards.map(standard => (
                <div key={standard.id} className="flex gap-3">
                  <Badge variant="outline" className="shrink-0 h-fit">
                    {standard.code}
                  </Badge>
                  <p className="text-sm text-slate-700">{standard.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lessons" className="gap-2">
            <FileText className="h-4 w-4" />
            Lessons ({unit.lessons.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <Sparkles className="h-4 w-4" />
            All Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lessons</h2>
            <Button onClick={() => setIsAddLessonOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </div>

          {unit.lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">No lessons yet</h3>
                <p className="text-slate-500 mb-4">Add your first lesson to get started</p>
                <Button onClick={() => setIsAddLessonOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {unit.lessons.map((lesson, index) => (
                <AccordionItem 
                  key={lesson.id} 
                  value={lesson.id}
                  className="border rounded-lg px-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left flex-1">
                      <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">{lesson.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}
                          </div>
                          {lesson.scheduledDate && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(lesson.scheduledDate), 'MMM d, yyyy')}
                              </div>
                            </>
                          )}
                          <span>•</span>
                          <span>{lesson.resources.length} resources</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      <div>
                        <h4 className="font-medium text-sm text-slate-700 mb-2">Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                          {lesson.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="gap-2"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourcesPanel unit={unit} />
        </TabsContent>
      </Tabs>

      <AddLessonDialog
        open={isAddLessonOpen}
        onOpenChange={setIsAddLessonOpen}
        onAddLesson={handleAddLesson}
        unitSubject={unit.subject}
      />
    </div>
  )
}
