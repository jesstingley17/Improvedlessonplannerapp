import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { id: 'p1', name: 'Period 1', time: '08:30 - 09:30' },
  { id: 'p2', name: 'Period 2', time: '09:35 - 10:35' },
  { id: 'break', name: 'Recess', time: '10:35 - 10:55', type: 'break' },
  { id: 'p3', name: 'Period 3', time: '11:00 - 12:00' },
  { id: 'p4', name: 'Period 4', time: '12:05 - 01:05' },
  { id: 'lunch', name: 'Lunch', time: '01:05 - 01:50', type: 'break' },
  { id: 'p5', name: 'Period 5', time: '01:50 - 02:50' },
];

// Mock data
const INITIAL_LESSONS = {
  'Monday-p1': { subject: 'Math 101', title: 'Intro to Algebra', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  'Monday-p3': { subject: 'Physics', title: 'Velocity', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  'Tuesday-p1': { subject: 'Math 101', title: 'Linear Equations', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  'Tuesday-p2': { subject: 'Physics', title: 'Acceleration', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  'Wednesday-p1': { subject: 'Math 101', title: 'Graphing Lines', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  'Wednesday-p3': { subject: 'Physics', title: 'Lab: Motion', color: 'bg-purple-100 border-purple-200 text-purple-800' },
  'Thursday-p1': { subject: 'Math 101', title: 'Slope Formula', color: 'bg-blue-100 border-blue-200 text-blue-800' },
  'Friday-p1': { subject: 'Math 101', title: 'Quiz: Algebra', color: 'bg-red-100 border-red-200 text-red-800' },
  'Friday-p5': { subject: 'Art', title: 'Perspective', color: 'bg-orange-100 border-orange-200 text-orange-800' },
};

export function PlannerView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 7)); // Jan 7, 2026

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekRange = () => {
    // Mock week range for display
    return "Jan 5 - Jan 9, 2026";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-md p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-white hover:shadow-sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
             <span className="px-3 text-sm font-semibold text-slate-700 w-40 text-center">
              {getWeekRange()}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-white hover:shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <CalendarIcon className="h-4 w-4" /> Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="math">Math 101</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="art">Art</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
          <Button className="bg-indigo-600 text-white gap-2 h-9">
            <Plus className="h-4 w-4" /> Add Lesson
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="min-w-[1000px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200 bg-slate-50">
            <div className="p-4 border-r border-slate-200 flex items-center justify-center text-slate-400 font-medium text-xs uppercase tracking-wider">
              Time
            </div>
            {DAYS.map((day, index) => (
              <div key={day} className="p-4 border-r border-slate-200 last:border-r-0 text-center">
                <div className="font-semibold text-slate-900">{day}</div>
                <div className={`text-xs mt-1 font-medium ${index === 2 ? 'text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-full' : 'text-slate-500'}`}>
                  Jan {5 + index}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {PERIODS.map((period) => (
            <div key={period.id} className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-200 last:border-b-0 min-h-[120px]">
              {/* Time Column */}
              <div className="p-3 border-r border-slate-200 flex flex-col items-center justify-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 block text-center mb-1">{period.name}</span>
                <span className="text-[10px] text-slate-500 text-center leading-tight">{period.time}</span>
              </div>

              {/* Day Columns */}
              {period.type === 'break' ? (
                <div className="col-span-5 bg-slate-50/80 flex items-center justify-center p-2">
                  <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">{period.name}</span>
                </div>
              ) : (
                DAYS.map((day) => {
                  const lessonKey = `${day}-${period.id}` as keyof typeof INITIAL_LESSONS;
                  const lesson = INITIAL_LESSONS[lessonKey];

                  return (
                    <div key={`${day}-${period.id}`} className="border-r border-slate-200 last:border-r-0 p-2 group relative transition-colors hover:bg-slate-50">
                       {/* Add Button (Visible on Hover) */}
                      {!lesson && (
                        <button className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                            <Plus className="h-4 w-4" />
                          </div>
                        </button>
                      )}

                      {/* Lesson Card */}
                      {lesson && (
                        <div className={`h-full w-full rounded-lg border p-3 flex flex-col gap-1 cursor-pointer transition-shadow hover:shadow-md ${lesson.color}`}>
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{lesson.subject}</span>
                          </div>
                          <p className="font-semibold text-sm leading-tight line-clamp-2">{lesson.title}</p>
                          <div className="mt-auto pt-2 flex items-center gap-2">
                             {/* Optional tags or icons could go here */}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
