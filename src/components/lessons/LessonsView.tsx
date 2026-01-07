import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, FileText, Tag, Calendar, Clock, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

// Define Lesson Type
type Lesson = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  status: 'Draft' | 'Published';
  date: string;
};

export function LessonsView() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Lesson Form State
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    subject: 'Mathematics',
    grade: '9',
    duration: '60 min',
    status: 'Draft',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/lessons`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleCreateLesson = async () => {
    try {
      const lessonToSave = {
        ...newLesson,
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonToSave)
      });

      if (response.ok) {
        const savedLesson = await response.json();
        setLessons([savedLesson, ...lessons]);
        setIsDialogOpen(false);
        setNewLesson({ // Reset form
          title: '',
          subject: 'Mathematics',
          grade: '9',
          duration: '60 min',
          status: 'Draft',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lesson Library</h1>
          <p className="text-slate-500 mt-1">Manage and organize all your curriculum materials.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 text-white gap-2">
              <Plus className="h-4 w-4" /> Create New Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Lesson</DialogTitle>
              <DialogDescription>
                Add a new lesson plan to your library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  className="col-span-3" 
                  value={newLesson.title} 
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="e.g. Intro to Algebra"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Subject</Label>
                <Input 
                  id="subject" 
                  className="col-span-3" 
                  value={newLesson.subject} 
                  onChange={(e) => setNewLesson({...newLesson, subject: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">Grade</Label>
                <Input 
                  id="grade" 
                  className="col-span-3" 
                  value={newLesson.grade} 
                  onChange={(e) => setNewLesson({...newLesson, grade: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateLesson} disabled={!newLesson.title}>Save Lesson</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search lessons by title, subject, or tag..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-slate-600">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="h-12 w-12 text-slate-300 mb-2" />
            <p>No lessons found. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-4">Lesson Title</div>
              <div className="col-span-2 hidden sm:block">Subject</div>
              <div className="col-span-2 hidden sm:block">Grade</div>
              <div className="col-span-2 hidden sm:block">Status</div>
              <div className="col-span-2 hidden sm:block text-right">Last Edited</div>
              <div className="col-span-6 sm:col-span-2 block sm:hidden text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
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
                  
                  <div className="col-span-6 sm:col-span-2 flex items-center justify-end">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
