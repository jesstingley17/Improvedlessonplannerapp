import { UnitPlan, Lesson, Standard, Resource } from './types'

// Mock AI generation for now - can be replaced with actual AI API calls
export async function generateUnitPlan(
  title: string,
  subject: string,
  gradeLevel: string,
  startDate: string,
  endDate: string,
  description: string,
  numLessons: number
): Promise<Partial<UnitPlan>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  const standards: Standard[] = [
    {
      id: `std-1`,
      code: 'CCSS.ELA-LITERACY.RL.9-10.1',
      description: 'Cite strong and thorough textual evidence to support analysis',
      subject,
      gradeLevel
    },
    {
      id: `std-2`,
      code: 'CCSS.ELA-LITERACY.RL.9-10.2',
      description: 'Determine a theme or central idea of a text',
      subject,
      gradeLevel
    },
    {
      id: `std-3`,
      code: 'CCSS.ELA-LITERACY.RL.9-10.3',
      description: 'Analyze how complex characters develop over the course of a text',
      subject,
      gradeLevel
    }
  ]

  const lessons: Lesson[] = Array.from({ length: numLessons }, (_, i) => ({
    id: `lesson-${Date.now()}-${i}`,
    title: `Lesson ${i + 1}: ${getLessonTitle(subject, i)}`,
    objectives: [
      `Understand key concepts related to ${subject}`,
      `Apply knowledge through hands-on activities`,
      `Demonstrate mastery through assessment`
    ],
    activities: `Introduction (10 min): Review previous lesson and introduce new concepts\n\nMain Activity (25 min): Interactive exercises and group work\n\nPractice (15 min): Individual practice with guided support\n\nClosure (10 min): Summarize key points and assign homework`,
    materials: ['Textbook', 'Worksheets', 'Digital presentation', 'Whiteboard'],
    assessment: 'Formative: Exit ticket with 3 key questions\nSummative: Weekly quiz on Friday',
    duration: '60 minutes',
    notes: '',
    resources: generateResources(subject, i)
  }))

  return {
    standards,
    lessons
  }
}

function getLessonTitle(subject: string, index: number): string {
  const titles: Record<string, string[]> = {
    'Mathematics': ['Introduction to Algebra', 'Linear Equations', 'Graphing Functions', 'Quadratic Equations', 'Systems of Equations'],
    'English': ['Literary Analysis', 'Persuasive Writing', 'Poetry Interpretation', 'Research Skills', 'Critical Reading'],
    'Science': ['Scientific Method', 'Lab Safety & Procedures', 'Data Analysis', 'Hypothesis Testing', 'Experimental Design'],
    'History': ['Primary Sources', 'Historical Context', 'Cause and Effect', 'Comparative Analysis', 'Timeline Creation']
  }
  
  const subjectTitles = titles[subject] || ['Core Concepts', 'Application', 'Practice', 'Review', 'Assessment']
  return subjectTitles[index % subjectTitles.length]
}

function generateResources(subject: string, lessonIndex: number): Resource[] {
  return [
    {
      id: `res-worksheet-${lessonIndex}`,
      type: 'worksheet',
      title: `Practice Worksheet ${lessonIndex + 1}`,
      description: `Hands-on practice problems covering key ${subject} concepts`,
      estimatedTime: '20 minutes',
      alignedObjectives: ['Objective 1', 'Objective 2']
    },
    {
      id: `res-text-${lessonIndex}`,
      type: 'text',
      title: `Reading: ${subject} Fundamentals`,
      description: 'Core reading material with comprehension questions',
      estimatedTime: '30 minutes',
      alignedObjectives: ['Objective 1']
    },
    {
      id: `res-quiz-${lessonIndex}`,
      type: 'quiz',
      title: 'Quick Check Quiz',
      description: '10-question formative assessment',
      estimatedTime: '15 minutes',
      alignedObjectives: ['Objective 1', 'Objective 2', 'Objective 3']
    }
  ]
}

export async function generateLesson(
  unitSubject: string,
  topic: string
): Promise<Lesson> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    id: `lesson-${Date.now()}`,
    title: topic,
    objectives: [
      `Understand core principles of ${topic}`,
      `Apply concepts through practical examples`,
      `Analyze and evaluate different approaches`
    ],
    activities: `Warm-up (5 min): Quick review question\n\nInstruction (20 min): Direct teaching with examples\n\nGuided Practice (20 min): Work through problems together\n\nIndependent Practice (10 min): Students work individually\n\nReview (5 min): Recap and preview next lesson`,
    materials: ['Handouts', 'Visual aids', 'Practice problems'],
    assessment: 'Formative assessment through observation and questioning',
    duration: '60 minutes',
    notes: '',
    resources: generateResources(unitSubject, 0)
  }
}

export async function generateResourceContent(
  resourceType: string,
  title: string,
  description: string
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800))

  const templates: Record<string, string> = {
    worksheet: `# ${title}\n\n## Instructions\nComplete the following exercises based on today's lesson.\n\n### Part 1: Vocabulary\n1. Define the following terms:\n   - Term 1: _______________\n   - Term 2: _______________\n\n### Part 2: Application\n1. Question 1\n   Answer: _______________\n\n2. Question 2\n   Answer: _______________\n\n### Part 3: Critical Thinking\nExplain your reasoning for the following scenario...\n\n---\nAnswer Key (Teacher Copy)\n1. Sample answer\n2. Sample answer`,
    quiz: `# ${title}\n\n## Multiple Choice (5 points each)\n\n1. Question 1\n   a) Option A\n   b) Option B\n   c) Option C\n   d) Option D\n\n2. Question 2\n   a) Option A\n   b) Option B\n   c) Option C\n   d) Option D\n\n## Short Answer (10 points each)\n\n3. Question 3\n\n4. Question 4\n\n## Essay (20 points)\n\n5. Extended response question\n\n---\nAnswer Key:\n1. B\n2. C\n3. Sample answer\n4. Sample answer\n5. Rubric points`,
    assignment: `# ${title}\n\n## Objectives\n${description}\n\n## Instructions\n1. Complete the reading assignment\n2. Answer reflection questions\n3. Submit by the due date\n\n## Tasks\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n\n## Grading Rubric\n- Completion: 40%\n- Quality: 40%\n- Timeliness: 20%\n\nTotal Points: 100`,
    exam: `# ${title}\n\n## Section 1: Multiple Choice (50 points)\n20 questions @ 2.5 points each\n\n## Section 2: Short Answer (30 points)\n6 questions @ 5 points each\n\n## Section 3: Essay (20 points)\n1 extended response\n\n---\n\nTime Limit: 90 minutes\nTotal Points: 100\n\nAnswer Key Available to Instructors`,
    text: `# ${title}\n\n## Overview\n${description}\n\n## Key Concepts\n\n### Concept 1\nDetailed explanation...\n\n### Concept 2\nDetailed explanation...\n\n### Concept 3\nDetailed explanation...\n\n## Summary\nKey takeaways from this reading...\n\n## Discussion Questions\n1. Question 1\n2. Question 2\n3. Question 3`
  }

  return templates[resourceType] || `# ${title}\n\n${description}\n\nContent generated for ${resourceType}.`
}

export async function generateEnhancementSuggestions(
  lesson: Lesson,
  type: 'differentiation' | 'technology' | 'assessment'
): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 700))

  const suggestions: Record<string, string[]> = {
    differentiation: [
      'Provide scaffolded worksheets with varying levels of support',
      'Offer choice boards allowing students to demonstrate learning in different ways',
      'Create small group instruction for students needing additional support',
      'Develop extension activities for advanced learners',
      'Use visual aids and graphic organizers for visual learners'
    ],
    technology: [
      'Incorporate interactive digital simulations to illustrate concepts',
      'Use online collaboration tools for group projects',
      'Create virtual exit tickets using Google Forms or Kahoot',
      'Leverage educational videos to flip the classroom',
      'Implement learning management system for resource sharing'
    ],
    assessment: [
      'Add formative checkpoints throughout the lesson',
      'Create rubrics for clear expectations and consistent grading',
      'Use peer assessment to build critical thinking skills',
      'Implement portfolio assessment to track growth over time',
      'Design authentic assessments connected to real-world scenarios'
    ]
  }

  return suggestions[type] || []
}

export async function generateUnitImprovements(
  unit: UnitPlan
): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 1000))

  return [
    'Consider adding more hands-on activities in lessons 2-4 to increase engagement',
    'The pacing could be adjusted - lesson 3 covers a lot of content for one session',
    'Include more formative assessments throughout the unit to check understanding',
    'Add cross-curricular connections to make learning more relevant',
    'Consider incorporating current events or real-world applications',
    'Build in more opportunities for student collaboration and discussion',
    'Ensure assessments align with all stated learning objectives'
  ]
}
