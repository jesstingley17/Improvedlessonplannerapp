import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { FileText, BookOpen, ClipboardList, FileCheck, GraduationCap, Copy, Loader2, RefreshCw } from 'lucide-react'
import { Resource, ResourceType } from '../../lib/types'
import { generateResourceContent } from '../../lib/ai-helpers'
import { toast } from 'sonner'

const resourceIcons: Record<ResourceType, any> = {
  worksheet: FileText,
  text: BookOpen,
  quiz: ClipboardList,
  assignment: FileCheck,
  exam: GraduationCap
}

const resourceColors: Record<ResourceType, string> = {
  worksheet: 'text-blue-500',
  text: 'text-green-500',
  quiz: 'text-purple-500',
  assignment: 'text-orange-500',
  exam: 'text-red-500'
}

interface ResourceCardProps {
  resource: Resource
  compact?: boolean
}

export function ResourceCard({ resource, compact = false }: ResourceCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const Icon = resourceIcons[resource.type]
  const iconColor = resourceColors[resource.type]

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const generated = await generateResourceContent(resource.type, resource.title, resource.description)
      setContent(generated)
      toast.success('Resource generated!')
    } catch (error) {
      toast.error('Failed to generate resource')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      toast.success('Copied to clipboard!')
    }
  }

  const handleOpenDialog = () => {
    setIsOpen(true)
    if (!content) {
      handleGenerate()
    }
  }

  if (compact) {
    return (
      <>
        <button
          onClick={handleOpenDialog}
          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
        >
          <div className="flex items-start gap-2">
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-slate-900 line-clamp-1">{resource.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{resource.estimatedTime}</p>
            </div>
          </div>
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                {resource.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
                  <Badge variant="outline" className="text-xs">{resource.estimatedTime}</Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : content ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                  </div>
                  <pre className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border border-slate-200 max-h-96 overflow-y-auto">
                    {content}
                  </pre>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleOpenDialog}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className={`p-2 bg-slate-100 rounded-lg shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
                <Badge variant="outline" className="text-xs">{resource.estimatedTime}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 line-clamp-2">{resource.description}</p>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              {resource.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
                <Badge variant="outline" className="text-xs">{resource.estimatedTime}</Badge>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : content ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </div>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border border-slate-200 max-h-96 overflow-y-auto">
                  {content}
                </pre>
              </div>
            ) : (
              <Button onClick={handleGenerate} className="w-full">
                Generate Resource Content
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
