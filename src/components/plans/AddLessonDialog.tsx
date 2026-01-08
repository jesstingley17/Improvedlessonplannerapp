import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Loader2 } from 'lucide-react'
import { generateLesson } from '../../lib/ai-helpers'
import { Lesson } from '../../lib/types'
import { toast } from 'sonner'

interface AddLessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddLesson: (lesson: Lesson) => void
  unitSubject: string
}

export function AddLessonDialog({ open, onOpenChange, onAddLesson, unitSubject }: AddLessonDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [topic, setTopic] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      toast.error('Please enter a lesson topic')
      return
    }

    setIsGenerating(true)
    
    try {
      const newLesson = await generateLesson(unitSubject, topic)
      onAddLesson(newLesson)
      setTopic('')
    } catch (error) {
      console.error('Error generating lesson:', error)
      toast.error('Failed to generate lesson')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Enter the topic and AI will generate a complete lesson plan with objectives, activities, and resources.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="topic">Lesson Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Solving Linear Equations"
              disabled={isGenerating}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Lesson'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
