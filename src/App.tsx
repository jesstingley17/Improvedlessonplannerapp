import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Settings, 
  Users, 
  LogOut,
  Plus,
  Bell,
  Search,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlannerView } from './components/planner/PlannerView';
import { UnitPlanList } from './components/plans/UnitPlanList';
import { UnitPlanEditor } from './components/plans/UnitPlanEditor';
import { CreateUnitDialog } from './components/plans/CreateUnitDialog';
import { UnitPlan } from './lib/types';
import { Toaster } from 'sonner';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Placeholder components for routes
const StudentsView = () => <div className="p-8"><h1 className="text-2xl font-bold">Students Directory</h1><p className="text-muted-foreground mt-2">Manage your class roster and student progress here.</p></div>;
const SettingsView = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Configure your preferences and account settings.</p></div>;

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [units, setUnits] = useState<UnitPlan[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Load units from Supabase
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching unit plans from backend...');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/units`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch units: ${response.status}`);
      }

      const data = await response.json();
      console.log('Units loaded:', data);
      setUnits(data.units || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUnit = async (newUnit: UnitPlan) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/units`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUnit)
      });

      if (!response.ok) {
        throw new Error('Failed to create unit');
      }

      await fetchUnits();
      setSelectedUnitId(newUnit.id);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleUpdateUnit = async (updatedUnit: UnitPlan) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/units/${updatedUnit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUnit)
      });

      if (!response.ok) {
        throw new Error('Failed to update unit');
      }

      setUnits(units.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    } catch (error) {
      console.error('Error updating unit:', error);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-825f6f99/units/${unitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      setUnits(units.filter(u => u.id !== unitId));
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedUnitId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} units={units} />;
      case 'planner':
        return <PlannerView />;
      case 'unit-plans':
        if (selectedUnit) {
          return (
            <div className="p-8">
              <UnitPlanEditor
                unit={selectedUnit}
                onUpdate={handleUpdateUnit}
                onBack={handleBackToList}
              />
            </div>
          );
        }
        return (
          <div className="p-8">
            <UnitPlanList
              units={units}
              onSelectUnit={setSelectedUnitId}
              onDeleteUnit={handleDeleteUnit}
            />
          </div>
        );
      case 'students':
        return <StudentsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard onViewChange={setCurrentView} units={units} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-10 left-0 top-0`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <BookOpen className="h-6 w-6" />
            {isSidebarOpen && <span>EduPlan</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Weekly Planner" 
            isActive={currentView === 'planner'} 
            onClick={() => setCurrentView('planner')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<Sparkles size={20} />} 
            label="Unit Plans" 
            isActive={currentView === 'unit-plans'} 
            onClick={() => {
              setCurrentView('unit-plans');
              setSelectedUnitId(null);
            }}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Students" 
            isActive={currentView === 'students'} 
            onClick={() => setCurrentView('students')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')}
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              JD
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Jane Doe</p>
                <p className="text-xs text-slate-500 truncate">Teacher</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-500">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">{currentView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search lessons..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            {currentView === 'unit-plans' && !selectedUnit && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" /> New Unit Plan
              </Button>
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {renderContent()}
        </div>
      </main>

      <CreateUnitDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateUnit={handleCreateUnit}
      />

      <Toaster />
    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick, isOpen }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } ${!isOpen && 'justify-center'}`}
      title={!isOpen ? label : undefined}
    >
      <div className={`${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
        {icon}
      </div>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}