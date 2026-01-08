import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Sparkles,
  FileText,
  Loader2
} from 'lucide-react'
import { Lesson, Resource } from '../../lib/types'
import { ResourceCard } from './ResourceCard'
import { generateEnhancementSuggestions } from '../../lib/ai-helpers'
import { toast } from 'sonner'

interface LessonEditorProps {
  lesson: Lesson
  unitSubject: string
  onUpdate: (lesson: Lesson) => void
  onBack: () => void
  onDelete: () => void
}

export function LessonEditor({ lesson, unitSubject, onUpdate, onBack, onDelete }: LessonEditorProps) {
  const [editedLesson, setEditedLesson] = useState(lesson)
  const [hasChanges, setHasChanges] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const handleChange = (field: keyof Lesson, value: any) => {
    setEditedLesson(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate(editedLesson)
    setHasChanges(false)
    toast.success('Lesson saved successfully')
  }

  const handleLoadSuggestions = async (type: 'differentiation' | 'technology' | 'assessment') => {
    setIsLoadingSuggestions(true)
    try {
      const newSuggestions = await generateEnhancementSuggestions(lesson, type)
      setSuggestions(newSuggestions)
      toast.success('Suggestions generated!')
    } catch (error) {
      toast.error('Failed to generate suggestions')
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleUpdateObjective = (index: number, value: string) => {
    const newObjectives = [...editedLesson.objectives]
    newObjectives[index] = value
    handleChange('objectives', newObjectives)
  }

  const handleAddObjective = () => {
    handleChange('objectives', [...editedLesson.objectives, ''])
  }

  const handleRemoveObjective = (index: number) => {
    const newObjectives = editedLesson.objectives.filter((_, i) => i !== index)
    handleChange('objectives', newObjectives)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={editedLesson.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-2xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 mb-2"
            />
            <p className="text-sm text-slate-500">Duration: {editedLesson.duration}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={!hasChanges} className="gap-2">
            <Save className="h-4 w-4" />
            {hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editedLesson.objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={obj}
                    onChange={(e) => handleUpdateObjective(index, e.target.value)}
                    placeholder="Enter learning objective..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveObjective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddObjective} className="w-full">
                Add Objective
              </Button>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Activities & Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedLesson.activities}
                onChange={(e) => handleChange('activities', e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder="Describe the lesson activities and procedures..."
              />
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Materials Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedLesson.materials.join('\n')}
                onChange={(e) => handleChange('materials', e.target.value.split('\n').filter(Boolean))}
                rows={4}
                placeholder="List materials (one per line)..."
              />
            </CardContent>
          </Card>

          {/* Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedLesson.assessment}
                onChange={(e) => handleChange('assessment', e.target.value)}
                rows={4}
                placeholder="Describe assessment methods..."
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedLesson.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Add any additional notes..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editedLesson.resources.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No resources yet</p>
              ) : (
                editedLesson.resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} compact />
                ))
              )}
            </CardContent>
          </Card>

          {/* AI Enhancements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                AI Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleLoadSuggestions('differentiation')}
                disabled={isLoadingSuggestions}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Differentiation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleLoadSuggestions('technology')}
                disabled={isLoadingSuggestions}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Technology
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleLoadSuggestions('assessment')}
                disabled={isLoadingSuggestions}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Assessment
              </Button>

              {suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="font-medium text-sm text-indigo-900 mb-2">Suggestions</h4>
                  <ul className="space-y-2 text-xs text-indigo-800">
                    {suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
