export type Standard = {
  id: string
  code: string
  description: string
  subject: string
  gradeLevel: string
}

export type ResourceType = 'worksheet' | 'text' | 'quiz' | 'assignment' | 'exam'

export type Resource = {
  id: string
  type: ResourceType
  title: string
  description: string
  estimatedTime: string
  alignedObjectives: string[]
}

export type Lesson = {
  id: string
  title: string
  objectives: string[]
  activities: string
  materials: string[]
  assessment: string
  duration: string
  scheduledDate?: string
  resources: Resource[]
  notes: string
}

export type UnitPlan = {
  id: string
  title: string
  subject: string
  gradeLevel: string
  startDate: string
  endDate: string
  standards: Standard[]
  lessons: Lesson[]
  description?: string
  createdAt: string
  updatedAt: string
}

export type CalendarEvent = {
  id: string
  lessonId: string
  unitId: string
  title: string
  date: string
  duration: string
}
