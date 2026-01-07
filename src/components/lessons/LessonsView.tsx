import React from 'react';
import { Search, Filter, Plus, MoreHorizontal, FileText, Tag, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const LESSONS = [
  { id: 1, title: 'Introduction to Algebra', subject: 'Mathematics', grade: '9', duration: '60 min', status: 'Published', date: 'Jan 7, 2026' },
  { id: 2, title: 'Newton\'s Laws of Motion', subject: 'Physics', grade: '10', duration: '90 min', status: 'Draft', date: 'Jan 10, 2026' },
  { id: 3, title: 'The Great Gatsby: Chapter 1', subject: 'English', grade: '11', duration: '45 min', status: 'Published', date: 'Jan 5, 2026' },
  { id: 4, title: 'Photosynthesis Lab', subject: 'Biology', grade: '9', duration: '90 min', status: 'Published', date: 'Jan 12, 2026' },
  { id: 5, title: 'World War II: Causes', subject: 'History', grade: '10', duration: '60 min', status: 'Draft', date: 'Jan 15, 2026' },
];

export function LessonsView() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lesson Library</h1>
          <p className="text-slate-500 mt-1">Manage and organize all your curriculum materials.</p>
        </div>
        <Button className="bg-indigo-600 text-white gap-2">
          <Plus className="h-4 w-4" /> Create New Lesson
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search lessons by title, subject, or tag..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="h-4 w-4" /> Subject
          </Button>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Tag className="h-4 w-4" /> Grade
          </Button>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Calendar className="h-4 w-4" /> Date
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6 sm:col-span-4">Lesson Title</div>
          <div className="col-span-2 hidden sm:block">Subject</div>
          <div className="col-span-2 hidden sm:block">Grade</div>
          <div className="col-span-2 hidden sm:block">Status</div>
          <div className="col-span-2 hidden sm:block text-right">Last Edited</div>
          <div className="col-span-6 sm:col-span-2 block sm:hidden text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {LESSONS.map((lesson) => (
            <div key={lesson.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
              <div className="col-span-6 sm:col-span-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 sm:hidden">
                      <span>{lesson.subject}</span>
                      <span>•</span>
                      <span>{lesson.grade}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                       <Clock className="h-3 w-3" /> {lesson.duration}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 hidden sm:flex items-center">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal hover:bg-slate-200">
                  {lesson.subject}
                </Badge>
              </div>

              <div className="col-span-2 hidden sm:flex items-center text-sm text-slate-600">
                Grade {lesson.grade}
              </div>

              <div className="col-span-2 hidden sm:flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lesson.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {lesson.status}
                </span>
              </div>

              <div className="col-span-2 hidden sm:flex items-center justify-end text-sm text-slate-500">
                {lesson.date}
              </div>
              
              <div className="col-span-6 sm:col-span-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Showing 1-5 of 18 lessons</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
