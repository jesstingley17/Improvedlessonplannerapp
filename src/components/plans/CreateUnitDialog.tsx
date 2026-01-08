import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Loader2, Upload, FileText, Wand2 } from 'lucide-react'
import { generateUnitPlan } from '../../lib/ai-helpers'
import { UnitPlan } from '../../lib/types'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface CreateUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateUnit: (unit: UnitPlan) => void
}

export function CreateUnitDialog({ open, onOpenChange, onCreateUnit }: CreateUnitDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('manual')
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    startDate: '',
    endDate: '',
    description: '',
    numLessons: '5'
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      toast.success('PDF uploaded successfully')
    }
  }

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Please upload a PDF file')
      return
    }

    if (!formData.subject || !formData.gradeLevel) {
      toast.error('Please select subject and grade level')
      return
    }

    setIsGenerating(true)
    
    try {
      // Convert PDF to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      
      await new Promise((resolve, reject) => {
        reader.onload = resolve
        reader.onerror = reject
      })

      const base64Data = (reader.result as string).split(',')[1]

      console.log('Uploading PDF and generating unit plan...')
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/generate-unit-from-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pdfData: base64Data,
          fileName: selectedFile.name,
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          startDate: formData.startDate,
          endDate: formData.endDate
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate unit from PDF')
      }

      const result = await response.json()
      
      const newUnit: UnitPlan = {
        id: `unit-${Date.now()}`,
        title: result.title,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: result.description,
        standards: result.standards || [],
        lessons: result.lessons || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onCreateUnit(newUnit)
      toast.success('Unit plan generated from PDF!')
      
      // Reset form
      setSelectedFile(null)
      setFormData({
        title: '',
        subject: '',
        gradeLevel: '',
        startDate: '',
        endDate: '',
        description: '',
        numLessons: '5'
      })
    } catch (error) {
      console.error('Error generating unit from PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate unit from PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.subject || !formData.gradeLevel || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    
    try {
      const generated = await generateUnitPlan(
        formData.title,
        formData.subject,
        formData.gradeLevel,
        formData.startDate,
        formData.endDate,
        formData.description,
        parseInt(formData.numLessons)
      )

      const newUnit: UnitPlan = {
        id: `unit-${Date.now()}`,
        title: formData.title,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        standards: generated.standards || [],
        lessons: generated.lessons || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onCreateUnit(newUnit)
      toast.success('Unit plan created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        subject: '',
        gradeLevel: '',
        startDate: '',
        endDate: '',
        description: '',
        numLessons: '5'
      })
    } catch (error) {
      console.error('Error generating unit plan:', error)
      toast.error('Failed to generate unit plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Unit Plan</DialogTitle>
          <DialogDescription>
            Create a unit plan manually or upload a PDF curriculum document to generate one with AI.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Unit Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to Algebra"
                    disabled={isGenerating}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                      disabled={isGenerating}
                      required
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="gradeLevel">Grade Level *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
                      disabled={isGenerating}
                      required
                    >
                      <SelectTrigger id="gradeLevel">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => i).map(grade => (
                          <SelectItem key={grade} value={grade === 0 ? 'K' : `Grade ${grade}`}>
                            {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={isGenerating}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={isGenerating}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="numLessons">Number of Lessons</Label>
                  <Select
                    value={formData.numLessons}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, numLessons: value }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger id="numLessons">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} lessons
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Unit Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the focus and goals of this unit..."
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
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
                    'Create Unit Plan'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="pdf">
            <form onSubmit={handlePdfUpload} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-upload">Upload Curriculum PDF *</Label>
                  <div className="mt-2">
                    <label 
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300 hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {selectedFile ? (
                          <>
                            <FileText className="w-10 h-10 mb-2 text-indigo-500" />
                            <p className="text-sm text-slate-700 font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mb-2 text-slate-400" />
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">PDF up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isGenerating}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pdf-subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                      disabled={isGenerating}
                      required
                    >
                      <SelectTrigger id="pdf-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pdf-gradeLevel">Grade Level *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
                      disabled={isGenerating}
                      required
                    >
                      <SelectTrigger id="pdf-gradeLevel">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => i).map(grade => (
                          <SelectItem key={grade} value={grade === 0 ? 'K' : `Grade ${grade}`}>
                            {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pdf-startDate">Start Date (Optional)</Label>
                    <Input
                      id="pdf-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pdf-endDate">End Date (Optional)</Label>
                    <Input
                      id="pdf-endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex gap-3">
                  <Wand2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-indigo-900 mb-1">AI-Powered Analysis</h4>
                    <p className="text-xs text-indigo-700">
                      Our AI will analyze your curriculum PDF and automatically extract unit objectives, learning standards, lesson topics, and assessment strategies to create a comprehensive unit plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating || !selectedFile}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing PDF...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate from PDF
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}