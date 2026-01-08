import React from 'react';
import { 
  Clock, 
  MoreVertical, 
  CalendarDays, 
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { UnitPlan } from '../../lib/types';
import { format, isToday, parseISO, isFuture } from 'date-fns';

export function Dashboard({ onViewChange, units = [] }: { onViewChange: (view: string) => void, units?: UnitPlan[] }) {
  // Calculate stats from unit plans
  const totalLessons = units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  const totalResources = units.reduce((sum, unit) => 
    sum + unit.lessons.reduce((lSum, lesson) => lSum + lesson.resources.length, 0), 0
  );
  const totalStandards = units.reduce((sum, unit) => sum + unit.standards.length, 0);
  
  // Get today's lessons
  const todayLessons = units.flatMap(unit => 
    unit.lessons
      .filter(lesson => lesson.scheduledDate && isToday(parseISO(lesson.scheduledDate)))
      .map(lesson => ({ ...lesson, unitTitle: unit.title, unitSubject: unit.subject }))
  );

  // Get upcoming lessons (next 7 days)
  const upcomingLessons = units.flatMap(unit =>
    unit.lessons.filter(lesson => 
      lesson.scheduledDate && isFuture(parseISO(lesson.scheduledDate))
    )
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good Morning, Jane! 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening in your classrooms today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <CalendarDays className="h-4 w-4" />
          <span>Wednesday, Jan 7, 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Unit Plans" 
          value={units.length.toString()} 
          icon={<Sparkles className="h-4 w-4 text-indigo-500" />} 
          trend={`${totalLessons} lessons total`}
          trendUp={true}
        />
        <StatCard 
          title="Total Lessons" 
          value={totalLessons.toString()} 
          icon={<FileText className="h-4 w-4 text-blue-500" />} 
          trend={`${upcomingLessons} upcoming`}
          trendUp={true}
        />
        <StatCard 
          title="Resources" 
          value={totalResources.toString()} 
          icon={<CheckCircle className="h-4 w-4 text-green-500" />} 
          trend={`Ready to use`}
          trendUp={true}
        />
        <StatCard 
          title="Standards" 
          value={totalStandards.toString()} 
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />} 
          trend="Aligned"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
            <Button variant="outline" size="sm" onClick={() => onViewChange('planner')}>
              View Full Week
            </Button>
          </div>

          <div className="space-y-4">
            {todayLessons.map((lesson, index) => (
              <ScheduleItem 
                key={index}
                time={format(parseISO(lesson.scheduledDate), 'h:mm a')} 
                subject={lesson.unitSubject} 
                topic={lesson.title} 
                grade={lesson.grade}
                room={lesson.room}
                color="border-l-blue-500"
                status="current"
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar - Tasks & Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks</CardTitle>
              <CardDescription>To-dos for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskItem label="Grade Math Assignments" completed={true} />
              <TaskItem label="Prepare Physics Lab Materials" completed={false} />
              <TaskItem label="Email Parent (John Smith)" completed={false} />
              <TaskItem label="Submit Monthly Report" completed={false} />
              <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 text-sm mt-2">
                + Add New Task
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Weekly Goal</h3>
                <p className="text-indigo-100 text-sm">Complete all lesson plans for next week by Friday.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="bg-indigo-900/50 [&>div]:bg-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              {icon}
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className={`text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-slate-500'}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleItem({ time, subject, topic, grade, room, color, status }: any) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md ${isCurrent ? 'ring-2 ring-indigo-500/20' : ''}`}>
      <div className="min-w-[80px] flex flex-col items-center justify-center pt-1">
        <span className="text-sm font-bold text-slate-700">{time}</span>
        {isCurrent && (
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
            NOW
          </span>
        )}
      </div>
      
      <div className={`flex-1 border-l-4 ${color} pl-4`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-slate-800">{subject}</h4>
            <p className="text-sm text-slate-600 mt-0.5">{topic}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
            <Users className="h-3 w-3" /> {grade}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
            <MapPinIcon className="h-3 w-3" /> {room}
          </span>
        </div>
      </div>
    </div>
  );
}

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

function TaskItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <span className={`text-sm ${completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
   return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
   )
}