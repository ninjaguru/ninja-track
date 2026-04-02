import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutGrid, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Flag, 
  Clock,
  FolderKanban,
  MoreVertical,
  Search,
  Settings,
  X,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Menu,
  Briefcase,
  User,
  Zap,
  Repeat,
  BarChart3,
  LogOut,
  Lock,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Project, Task, Priority, Recurrence, TimeLog } from './types';

const COLORS = [
  '#3b82f6', '#a855f7', '#10b981', 
  '#f43f5e', '#f59e0b', '#6366f1',
  '#06b6d4', '#f97316'
];

const BG_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
  'bg-rose-500', 'bg-amber-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-orange-500'
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'ninjaproctor@gmail.com' && password === 'Q1p0w2o9#@') {
      onLogin();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">FocusFlow Login</h1>
          <p className="text-slate-500 text-center mt-2">Enter your credentials to access your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="ninjaproctor@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ReportsView({ projects }: { projects: Project[] }) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let threshold = startOfWeek;
    if (timeRange === 'daily') threshold = startOfDay;
    if (timeRange === 'monthly') threshold = startOfMonth;

    const projectData = projects.map((p, idx) => {
      const timeInSeconds = p.tasks.reduce((acc, t) => {
        const relevantLogs = t.timeLogs?.filter(log => new Date(log.date).getTime() >= threshold) || [];
        return acc + relevantLogs.reduce((sum, l) => sum + l.seconds, 0);
      }, 0);

      return {
        name: p.name,
        value: Math.round(timeInSeconds / 60), // in minutes
        color: COLORS[idx % COLORS.length]
      };
    }).filter(d => d.value > 0);

    const taskStats = projects.reduce((acc, p) => {
      p.tasks.forEach(t => {
        if (t.completed) acc.completed++;
        else acc.active++;
      });
      return acc;
    }, { completed: 0, active: 0 });

    const completionData = [
      { name: 'Completed', value: taskStats.completed, color: '#10b981' },
      { name: 'Active', value: taskStats.active, color: '#3b82f6' }
    ].filter(d => d.value > 0);

    return { projectData, completionData, totalTasks: taskStats.completed + taskStats.active };
  }, [projects, timeRange]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <header className="mb-10 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-brand-600" size={20} />
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Performance Reports</h2>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['daily', 'weekly', 'monthly'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                timeRange === r 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Time Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Time by Project (min)</h3>
          </div>
          
          <div className="h-64 w-full">
            {stats.projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No time data for this period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Task Completion Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Task Completion</h3>
          </div>

          <div className="h-64 w-full">
            {stats.completionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No tasks found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Time Tracked ({timeRange})</p>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(stats.projectData.reduce((acc, d) => acc + d.value, 0))} <span className="text-sm font-normal text-slate-400">min</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats.totalTasks > 0 ? Math.round((stats.completionData.find(d => d.name === 'Completed')?.value || 0) / stats.totalTasks * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'personal',
    name: 'Personal',
    description: 'Personal tasks and life admin',
    color: 'bg-emerald-500',
    tasks: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'official',
    name: 'Official',
    description: 'Work and professional responsibilities',
    color: 'bg-blue-500',
    tasks: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'side-hustle',
    name: 'Side Hustles',
    description: 'Projects and extra income streams',
    color: 'bg-amber-500',
    tasks: [],
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('focusflow_logged_in') === 'true');
  const [view, setView] = useState<'tasks' | 'reports'>('tasks');
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('focusflow_projects_v3');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects[0]?.id || null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('focusflow_projects_v3', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('focusflow_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Global timer effect for running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prevProjects => prevProjects.map(project => ({
        ...project,
        tasks: project.tasks.map(task => {
          if (task.isTimerRunning && task.lastTimerStart) {
            const now = new Date().getTime();
            const start = new Date(task.lastTimerStart).getTime();
            const elapsed = Math.floor((now - start) / 1000);
            
            if (elapsed >= 1) {
              const today = new Date().toISOString().split('T')[0];
              const updatedLogs = [...(task.timeLogs || [])];
              const todayLogIdx = updatedLogs.findIndex(l => l.date === today);
              
              if (todayLogIdx >= 0) {
                updatedLogs[todayLogIdx].seconds += elapsed;
              } else {
                updatedLogs.push({ date: today, seconds: elapsed });
              }

              return {
                ...task,
                timeSpent: (task.timeSpent || 0) + elapsed,
                timeLogs: updatedLogs,
                lastTimerStart: new Date().toISOString()
              };
            }
          }
          return task;
        })
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      description: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tasks: [],
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setIsAddingProject(false);
    setActiveProjectId(newProject.id);
    setIsSidebarOpen(false);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(projects[0]?.id || null);
    }
  };

  const addTask = (projectId: string, title: string, priority: Priority = 'medium', recurrence: Recurrence = 'none') => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [
            ...p.tasks,
            {
              id: crypto.randomUUID(),
              title,
              completed: false,
              priority,
              recurrence,
              createdAt: new Date().toISOString(),
              timeSpent: 0,
              timeLogs: [],
              isTimerRunning: false
            }
          ]
        };
      }
      return p;
    }));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              const isNowCompleted = !t.completed;
              
              // Handle recurrence logic
              if (isNowCompleted && t.recurrence !== 'none') {
                return { ...t, completed: false, timeSpent: 0, timeLogs: [], isTimerRunning: false };
              }
              
              return { ...t, completed: isNowCompleted, completedAt: isNowCompleted ? new Date().toISOString() : undefined, isTimerRunning: false };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const toggleTimer = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              const isStarting = !t.isTimerRunning;
              return {
                ...t,
                isTimerRunning: isStarting,
                lastTimerStart: isStarting ? new Date().toISOString() : undefined
              };
            }
            // Stop other timers if starting this one? (Optional, let's keep it simple)
            return t;
          })
        };
      }
      return p;
    }));
  };

  const resetTimer = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, timeSpent: 0, isTimerRunning: false, lastTimerStart: undefined } : t)
        };
      }
      return p;
    }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        };
      }
      return p;
    }));
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('personal')) return <User size={18} />;
    if (lower.includes('official') || lower.includes('work')) return <Briefcase size={18} />;
    if (lower.includes('hustle') || lower.includes('side')) return <Zap size={18} />;
    return <FolderKanban size={18} />;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <FolderKanban size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">FocusFlow</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <div className="space-y-1 mb-6">
            <button 
              onClick={() => { setView('tasks'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                view === 'tasks' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-semibold">Workspace</span>
            </button>
            <button 
              onClick={() => { setView('reports'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                view === 'reports' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-semibold">Reports</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</span>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isAddingProject && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-2 py-3 bg-slate-50 rounded-xl border border-slate-200 mb-2"
              >
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Project name..."
                  className="w-full bg-transparent border-none text-sm focus:ring-0 p-0 mb-2"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProject()}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsAddingProject(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addProject}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredProjects.map(project => (
            <button
              key={project.id}
              onClick={() => {
                setActiveProjectId(project.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                activeProjectId === project.id 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${activeProjectId === project.id ? 'text-brand-600' : 'text-slate-400'}`}>
                  {getProjectIcon(project.name)}
                </div>
                <span className="text-sm font-medium truncate max-w-[140px]">{project.name}</span>
              </div>
              <span className={`text-xs ${activeProjectId === project.id ? 'text-brand-500' : 'text-slate-400'}`}>
                {project.tasks.filter(t => !t.completed).length}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900">FocusFlow</span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {view === 'reports' ? (
          <ReportsView projects={projects} />
        ) : activeProject ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            <header className="mb-10 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${activeProject.color}`} />
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Project</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">{activeProject.name}</h2>
                <p className="text-slate-500 max-w-lg">
                  {activeProject.description || 'Manage your tasks and stay organized.'}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-start">
                <button 
                  onClick={() => deleteProject(activeProject.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Project"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </header>

            <section className="space-y-8">
              <AddTaskInput onAdd={(title, priority, recurrence) => addTask(activeProject.id, title, priority, recurrence)} />

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Tasks</h3>
                  <span className="text-xs text-slate-400">{activeProject.tasks.filter(t => !t.completed).length} items</span>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {activeProject.tasks.filter(t => !t.completed).map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => toggleTask(activeProject.id, task.id)}
                      onDelete={() => deleteTask(activeProject.id, task.id)}
                      onToggleTimer={() => toggleTimer(activeProject.id, task.id)}
                      onResetTimer={() => resetTimer(activeProject.id, task.id)}
                    />
                  ))}
                  {activeProject.tasks.filter(t => !t.completed).length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full text-slate-400 mb-4">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">All caught up! No active tasks.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {activeProject.tasks.some(t => t.completed) && (
                <div className="space-y-4 pt-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completed</h3>
                    <span className="text-xs text-slate-400">{activeProject.tasks.filter(t => t.completed).length} items</span>
                  </div>
                  <div className="opacity-60 grayscale-[0.5]">
                    {activeProject.tasks.filter(t => t.completed).map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(activeProject.id, task.id)}
                        onDelete={() => deleteTask(activeProject.id, task.id)}
                        onToggleTimer={() => {}}
                        onResetTimer={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <LayoutGrid size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Project Selected</h2>
            <p className="text-slate-500 max-w-xs mb-8">
              Select a project from the sidebar or create a new one to start managing your tasks.
            </p>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={20} />
              Create New Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function AddTaskInput({ onAdd }: { onAdd: (title: string, priority: Priority, recurrence: Recurrence) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, recurrence);
    setTitle('');
    setPriority('medium');
    setRecurrence('none');
    setIsExpanded(false);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-slate-200 p-2 transition-all ${
        isExpanded ? 'ring-2 ring-brand-500 border-transparent shadow-xl' : 'hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3 px-2">
        <div className="text-slate-400">
          <Plus size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Add a new task..."
          className="flex-1 py-3 text-lg bg-transparent border-none focus:ring-0 placeholder:text-slate-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
        />
        {title.trim() && (
          <button 
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all"
          >
            Add Task
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3 border-t border-slate-50 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Priority:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        priority === p 
                          ? p === 'high' ? 'bg-rose-100 text-rose-700' : p === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Repeat:</span>
                <div className="flex gap-1">
                  {(['none', 'daily', 'weekly', 'monthly'] as Recurrence[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        recurrence === r 
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />
              <button 
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-slate-400 hover:text-slate-600 self-end sm:self-auto"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onToggleTimer, 
  onResetTimer 
}: { 
  task: Task, 
  onToggle: () => void, 
  onDelete: () => void,
  onToggleTimer: () => void,
  onResetTimer: () => void,
  key?: string
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all ${
        task.completed ? 'bg-slate-50/50' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onToggle}
          className={`flex-shrink-0 transition-all ${
            task.completed ? 'text-brand-500' : 'text-slate-300 hover:text-brand-400'
          }`}
        >
          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-medium transition-all truncate ${
            task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Flag size={12} className={
                task.priority === 'high' ? 'text-rose-500' : 
                task.priority === 'medium' ? 'text-amber-500' : 
                'text-blue-500'
              } />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {task.priority}
              </span>
            </div>
            {task.recurrence !== 'none' && (
              <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                <Repeat size={10} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {task.recurrence}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-300" />
              <span className="text-[10px] font-medium text-slate-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pl-10 sm:pl-0">
        {!task.completed && (
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <span className={`text-sm font-mono font-medium ${task.isTimerRunning ? 'text-brand-600' : 'text-slate-500'}`}>
              {formatTime(task.timeSpent)}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={onToggleTimer}
                className={`p-1.5 rounded-lg transition-all ${
                  task.isTimerRunning 
                    ? 'bg-brand-100 text-brand-600 hover:bg-brand-200' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {task.isTimerRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>
              {task.timeSpent > 0 && (
                <button 
                  onClick={onResetTimer}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}
