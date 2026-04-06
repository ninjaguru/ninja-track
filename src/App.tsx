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
  User as UserIcon,
  Zap,
  Repeat,
  BarChart3,
  LogOut,
  Lock,
  PieChart as PieChartIcon,
  TrendingUp,
  Edit2,
  Target,
  LineChart as LineChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';
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

const SUGGESTED_EMOJIS = ['📁', '🚀', '🎯', '💡', '🔥', '🌈', '🎨', '💻', '📚', '🏠', '🌱', '⚡️'];

import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  onAuthStateChanged, 
  User, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Error</h2>
            <p className="text-slate-600 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (result.user.email !== 'ninjaproctor@gmail.com') {
        await logout();
        setError('Access denied. Only ninjaproctor@gmail.com is allowed.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('Login popup was blocked. Please enable popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-in. Please add it in the Firebase Console.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Login was cancelled. Please try again.');
      } else {
        setError(`Login failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
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
          <p className="text-slate-500 text-center mt-2">Sign in to sync your tasks across devices.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

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
          
          <p className="text-xs text-slate-400 text-center mt-6">
            By continuing, you agree to our terms and privacy policy.
          </p>
        </div>
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
    createdAt: new Date().toISOString(),
    ownerId: 'default'
  },
  {
    id: 'official',
    name: 'Official',
    description: 'Work and professional responsibilities',
    color: 'bg-blue-500',
    tasks: [],
    createdAt: new Date().toISOString(),
    ownerId: 'default'
  },
  {
    id: 'side-hustle',
    name: 'Side Hustles',
    description: 'Projects and extra income streams',
    color: 'bg-amber-500',
    tasks: [],
    createdAt: new Date().toISOString(),
    ownerId: 'default'
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'tasks' | 'reports' | 'kaizen'>('tasks');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectEmoji, setNewProjectEmoji] = useState('📁');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ projectId: string, taskId: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.email !== 'ninjaproctor@gmail.com') {
        logout();
        setUser(null);
      } else {
        setUser(u);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync projects and tasks from Firestore
  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }

    const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      
      // We need to fetch tasks for each project
      // For simplicity in this demo, we'll listen to all tasks owned by user
      // and map them to their respective projects
      const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
      
      const unsubscribeTasks = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        
        const updatedProjects = snapshot.docs.map(doc => {
          const pData = doc.data();
          return {
            id: doc.id,
            ...pData,
            tasks: allTasks.filter(t => t.projectId === doc.id)
          } as Project;
        });

        setProjects(updatedProjects);
        if (!activeProjectId && updatedProjects.length > 0) {
          setActiveProjectId(updatedProjects[0].id);
        }
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

      return () => unsubscribeTasks();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    return () => unsubscribeProjects();
  }, [user]);

  // Global timer effect for running tasks
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      const runningTasks = projects.flatMap(p => p.tasks).filter(t => t.isTimerRunning && t.lastTimerStart);
      
      for (const task of runningTasks) {
        const now = new Date().getTime();
        const start = new Date(task.lastTimerStart!).getTime();
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

          try {
            await updateDoc(doc(db, 'tasks', task.id), {
              timeSpent: (task.timeSpent || 0) + elapsed,
              timeLogs: updatedLogs,
              lastTimerStart: new Date().toISOString()
            });
          } catch (error) {
            console.error("Timer update failed", error);
          }
        }
      }
    }, 5000); // Update every 5 seconds to reduce writes
    return () => clearInterval(interval);
  }, [user, projects]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const addProject = async () => {
    if (!newProjectName.trim() || !user) return;
    try {
      const projectData = {
        name: newProjectName,
        description: '',
        emoji: newProjectEmoji,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: new Date().toISOString(),
        ownerId: user.uid
      };
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      setNewProjectName('');
      setNewProjectEmoji('📁');
      setIsAddingProject(false);
      setActiveProjectId(docRef.id);
      setIsSidebarOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Also delete all tasks in the project
      const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', id));
      const tasksSnapshot = await getDocs(tasksQuery);
      const batch = writeBatch(db);
      tasksSnapshot.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'projects', id));
      await batch.commit();
      
      if (activeProjectId === id) {
        setActiveProjectId(projects.find(p => p.id !== id)?.id || null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const addTask = async (projectId: string, title: string, priority: Priority = 'medium', recurrence: Recurrence = 'none', parentId?: string, dueDate?: string, kaizen?: { isKaizen: boolean, baseTime: number, improvement: number }) => {
    if (!user) return;
    try {
      const taskData = {
        title,
        completed: false,
        priority,
        recurrence,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || (recurrence !== 'none' ? getNextDueDate(recurrence) : null),
        timeSpent: 0,
        timeLogs: [],
        isTimerRunning: false,
        parentId: parentId || null,
        projectId,
        ownerId: user.uid,
        ...(kaizen?.isKaizen ? {
          isKaizen: true,
          kaizenBaseTime: kaizen.baseTime,
          kaizenDailyImprovement: kaizen.improvement,
          kaizenStartDate: new Date().toISOString()
        } : {})
      };
      await addDoc(collection(db, 'tasks'), taskData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}/tasks`);
    }
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), updates);
      setEditingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const moveTask = (projectId: string, taskId: string, direction: 'up' | 'down') => {
    // Note: Rearranging in Firestore would require a 'position' field.
    // For this demo, we'll keep it local-only or skip it.
    // Let's just log it for now as it's complex to implement correctly without a position field.
    console.log("Move task not fully implemented for Firestore yet");
  };

  const toggleTask = async (projectId: string, taskId: string) => {
    const task = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const isNowCompleted = !task.completed;
      
      if (isNowCompleted && task.recurrence !== 'none') {
        const nextDue = getNextDueDate(task.recurrence, task.dueDate || new Date().toISOString());
        await updateDoc(doc(db, 'tasks', taskId), {
          completed: false,
          timeSpent: 0,
          timeLogs: [],
          isTimerRunning: false,
          dueDate: nextDue
        });
      } else {
        await updateDoc(doc(db, 'tasks', taskId), {
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : null,
          isTimerRunning: false
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const toggleTimer = async (projectId: string, taskId: string) => {
    const task = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const isStarting = !task.isTimerRunning;
      await updateDoc(doc(db, 'tasks', taskId), {
        isTimerRunning: isStarting,
        lastTimerStart: isStarting ? new Date().toISOString() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const resetTimer = async (projectId: string, taskId: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        timeSpent: 0,
        isTimerRunning: false,
        lastTimerStart: null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('personal')) return <UserIcon size={18} />;
    if (lower.includes('official') || lower.includes('work')) return <Briefcase size={18} />;
    if (lower.includes('hustle') || lower.includes('side')) return <Zap size={18} />;
    return <FolderKanban size={18} />;
  };

  return (
    <ErrorBoundary>
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
            <button 
              onClick={() => { setView('kaizen'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                view === 'kaizen' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap size={18} />
              <span className="text-sm font-semibold">Kaizen Tracker</span>
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
                className="px-3 py-4 bg-white rounded-2xl border border-slate-200 mb-4 shadow-lg"
              >
                <div className="flex gap-3 mb-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="📁"
                      className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl focus:ring-2 focus:ring-brand-500 transition-all"
                      value={newProjectEmoji}
                      onChange={(e) => setNewProjectEmoji(e.target.value)}
                    />
                    <div className="absolute left-0 top-full mt-2 p-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 hidden group-focus-within:grid grid-cols-4 gap-1 w-32">
                      {SUGGESTED_EMOJIS.map(e => (
                        <button 
                          key={e}
                          onClick={() => setNewProjectEmoji(e)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-sm"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Project name..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 px-4 py-2 transition-all"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addProject()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addProject}
                    className="px-4 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md shadow-brand-100"
                  >
                    Create Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredProjects.map(project => (
            <div key={project.id} className="group relative">
              <div
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  activeProjectId === project.id && view === 'tasks'
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <button
                  onClick={() => {
                    setActiveProjectId(project.id);
                    setView('tasks');
                    setIsSidebarOpen(false);
                  }}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg ${activeProjectId === project.id && view === 'tasks' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                    {project.emoji || getProjectIcon(project.name)}
                  </div>
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </button>
                <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProjectId(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all text-slate-400 hover:text-brand-600"
                  >
                    <Edit2 size={12} />
                  </button>
                  <span className={`text-xs flex-shrink-0 ${activeProjectId === project.id && view === 'tasks' ? 'text-brand-500' : 'text-slate-400'}`}>
                    {project.tasks.filter(t => !t.completed).length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={() => logout()}
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
        ) : view === 'kaizen' ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            <KaizenView projects={projects} />
          </div>
        ) : activeProject ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            {/* Today's Focus Summary */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Today's Focus</h3>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatTime(projects.reduce((acc, p) => acc + p.tasks.reduce((tAcc, t) => tAcc + t.timeSpent, 0), 0))}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-medium">
                <TrendingUp size={16} className="text-emerald-500" />
                <span>+12% from yesterday</span>
              </div>
            </motion.div>
            <header className="mb-10 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${activeProject.color}`} />
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Project</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  {activeProject.emoji && <span className="text-4xl">{activeProject.emoji}</span>}
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{activeProject.name}</h2>
                </div>
                <p className="text-slate-500 max-w-lg">
                  {activeProject.description || 'Manage your tasks and stay organized.'}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-start">
                <button 
                  onClick={() => setEditingProjectId(activeProject.id)}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                  title="Edit Project"
                >
                  <Edit2 size={20} />
                </button>
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
              <AddTaskInput onAdd={(title, priority, recurrence, dueDate, kaizen) => addTask(activeProject.id, title, priority, recurrence, undefined, dueDate, kaizen)} />

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Tasks</h3>
                  <span className="text-xs text-slate-400">{activeProject.tasks.filter(t => !t.completed).length} items</span>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {activeProject.tasks.filter(t => !t.completed && !t.parentId).map(task => (
                    <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <TaskItem 
                        task={task} 
                        onToggle={() => toggleTask(activeProject.id, task.id)}
                        onDelete={() => deleteTask(activeProject.id, task.id)}
                        onToggleTimer={() => toggleTimer(activeProject.id, task.id)}
                        onResetTimer={() => resetTimer(activeProject.id, task.id)}
                        onEdit={() => setEditingTask({ projectId: activeProject.id, taskId: task.id })}
                        onAddSubtask={(title) => addTask(activeProject.id, title, 'medium', 'none', task.id)}
                      />
                      {activeProject.tasks.filter(st => st.parentId === task.id).map(subtask => (
                        <TaskItem 
                          key={subtask.id}
                          task={subtask} 
                          isSubtask
                          onToggle={() => toggleTask(activeProject.id, subtask.id)}
                          onDelete={() => deleteTask(activeProject.id, subtask.id)}
                          onToggleTimer={() => toggleTimer(activeProject.id, subtask.id)}
                          onResetTimer={() => resetTimer(activeProject.id, subtask.id)}
                          onEdit={() => setEditingTask({ projectId: activeProject.id, taskId: subtask.id })}
                          onAddSubtask={(title) => addTask(activeProject.id, title, 'medium', 'none', subtask.id)}
                        />
                      ))}
                    </motion.div>
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
                        onEdit={() => setEditingTask({ projectId: activeProject.id, taskId: task.id })}
                        onAddSubtask={(title) => addTask(activeProject.id, title, 'medium', 'none', task.id)}
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

      <AnimatePresence>
        {editingTask && (
          <EditTaskModal 
            task={projects.find(p => p.id === editingTask.projectId)?.tasks.find(t => t.id === editingTask.taskId)!}
            onClose={() => setEditingTask(null)}
            onSave={(updates) => {
              updateTask(editingTask.projectId, editingTask.taskId, updates);
              setEditingTask(null);
            }}
          />
        )}
        {editingProjectId && (
          <EditProjectModal 
            project={projects.find(p => p.id === editingProjectId)!}
            onClose={() => setEditingProjectId(null)}
            onSave={(updates) => {
              updateProject(editingProjectId, updates);
              setEditingProjectId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}

function AddTaskInput({ onAdd }: { onAdd: (title: string, priority: Priority, recurrence: Recurrence, dueDate?: string, kaizen?: { isKaizen: boolean, baseTime: number, improvement: number }) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [dueDate, setDueDate] = useState('');
  const [isKaizen, setIsKaizen] = useState(false);
  const [kaizenBaseMin, setKaizenBaseMin] = useState('10');
  const [kaizenBaseSec, setKaizenBaseSec] = useState('0');
  const [kaizenImproveMin, setKaizenImproveMin] = useState('1');
  const [kaizenImproveSec, setKaizenImproveSec] = useState('0');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, recurrence, dueDate || undefined, {
      isKaizen,
      baseTime: (parseInt(kaizenBaseMin) || 0) * 60 + (parseInt(kaizenBaseSec) || 0),
      improvement: (parseInt(kaizenImproveMin) || 0) * 60 + (parseInt(kaizenImproveSec) || 0)
    });
    setTitle('');
    setPriority('medium');
    setRecurrence('none');
    setDueDate('');
    setIsKaizen(false);
    setKaizenBaseMin('10');
    setKaizenBaseSec('0');
    setKaizenImproveMin('1');
    setKaizenImproveSec('0');
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

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Due:</span>
                <input 
                  type="date" 
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border-none focus:ring-1 focus:ring-brand-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKaizen(!isKaizen)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isKaizen ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Zap size={12} />
                  Kaizen
                </button>
              </div>

              {isKaizen && (
                <div className="flex flex-wrap items-center gap-4 bg-brand-50/50 p-2 rounded-xl border border-brand-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-600 uppercase">Base:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-10 px-1 py-0.5 text-xs bg-white border border-brand-200 rounded focus:ring-1 focus:ring-brand-500"
                        value={kaizenBaseMin}
                        onChange={(e) => setKaizenBaseMin(e.target.value)}
                        placeholder="Min"
                      />
                      <span className="text-[10px] text-brand-400">m</span>
                      <input 
                        type="number" 
                        className="w-10 px-1 py-0.5 text-xs bg-white border border-brand-200 rounded focus:ring-1 focus:ring-brand-500"
                        value={kaizenBaseSec}
                        onChange={(e) => setKaizenBaseSec(e.target.value)}
                        placeholder="Sec"
                      />
                      <span className="text-[10px] text-brand-400">s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-600 uppercase">Improve:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-10 px-1 py-0.5 text-xs bg-white border border-brand-200 rounded focus:ring-1 focus:ring-brand-500"
                        value={kaizenImproveMin}
                        onChange={(e) => setKaizenImproveMin(e.target.value)}
                        placeholder="Min"
                      />
                      <span className="text-[10px] text-brand-400">m</span>
                      <input 
                        type="number" 
                        className="w-10 px-1 py-0.5 text-xs bg-white border border-brand-200 rounded focus:ring-1 focus:ring-brand-500"
                        value={kaizenImproveSec}
                        onChange={(e) => setKaizenImproveSec(e.target.value)}
                        placeholder="Sec"
                      />
                      <span className="text-[10px] text-brand-400">s</span>
                    </div>
                  </div>
                </div>
              )}

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

function getNextDueDate(recurrence: Recurrence, fromDate: string = new Date().toISOString()) {
  const date = new Date(fromDate);
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  return date.toISOString();
}

function getKaizenGoal(task: Task) {
  if (!task.isKaizen || !task.kaizenBaseTime || !task.kaizenDailyImprovement || !task.kaizenStartDate) return 0;
  const start = new Date(task.kaizenStartDate).getTime();
  const now = new Date().getTime();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return task.kaizenBaseTime + (days * task.kaizenDailyImprovement);
}

function LiveTimer({ task }: { task: Task }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!task.isTimerRunning || !task.lastTimerStart) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(task.lastTimerStart!).getTime();
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [task.isTimerRunning, task.lastTimerStart]);

  return (
    <span className={`text-xs font-mono font-medium ${task.isTimerRunning ? 'text-brand-600' : 'text-slate-500'}`}>
      {formatTime(task.timeSpent + elapsed)}
    </span>
  );
}

function EditTaskModal({ 
  task, 
  onClose, 
  onSave 
}: { 
  task: Task, 
  onClose: () => void, 
  onSave: (updates: Partial<Task>) => void 
}) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [recurrence, setRecurrence] = useState<Recurrence>(task.recurrence);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [isKaizen, setIsKaizen] = useState(task.isKaizen || false);
  const [kaizenBaseMin, setKaizenBaseMin] = useState(task.kaizenBaseTime ? Math.floor(task.kaizenBaseTime / 60).toString() : '10');
  const [kaizenBaseSec, setKaizenBaseSec] = useState(task.kaizenBaseTime ? (task.kaizenBaseTime % 60).toString() : '0');
  const [kaizenImproveMin, setKaizenImproveMin] = useState(task.kaizenDailyImprovement ? Math.floor(task.kaizenDailyImprovement / 60).toString() : '1');
  const [kaizenImproveSec, setKaizenImproveSec] = useState(task.kaizenDailyImprovement ? (task.kaizenDailyImprovement % 60).toString() : '0');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit Task</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <div className="flex flex-col gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                      priority === p 
                        ? p === 'high' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500' : p === 'medium' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500' : 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Recurrence</label>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as Recurrence[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRecurrence(r)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    recurrence === r 
                      ? 'bg-slate-800 text-white ring-2 ring-slate-900'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsKaizen(!isKaizen)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                isKaizen ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Zap size={16} />
              {isKaizen ? 'Kaizen Tracking Enabled' : 'Enable Kaizen Tracking'}
            </button>
          </div>

          {isKaizen && (
            <div className="grid grid-cols-1 gap-4 bg-brand-50 p-4 rounded-2xl border border-brand-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-600 uppercase mb-1">Base Time</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
                        value={kaizenBaseMin}
                        onChange={(e) => setKaizenBaseMin(e.target.value)}
                        placeholder="Min"
                      />
                      <span className="text-xs text-brand-400">m</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
                        value={kaizenBaseSec}
                        onChange={(e) => setKaizenBaseSec(e.target.value)}
                        placeholder="Sec"
                      />
                      <span className="text-xs text-brand-400">s</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-600 uppercase mb-1">Daily Improvement</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
                        value={kaizenImproveMin}
                        onChange={(e) => setKaizenImproveMin(e.target.value)}
                        placeholder="Min"
                      />
                      <span className="text-xs text-brand-400">m</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
                        value={kaizenImproveSec}
                        onChange={(e) => setKaizenImproveSec(e.target.value)}
                        placeholder="Sec"
                      />
                      <span className="text-xs text-brand-400">s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ 
                title, 
                priority, 
                recurrence, 
                dueDate: dueDate || undefined,
                isKaizen,
                kaizenBaseTime: (parseInt(kaizenBaseMin) || 0) * 60 + (parseInt(kaizenBaseSec) || 0),
                kaizenDailyImprovement: (parseInt(kaizenImproveMin) || 0) * 60 + (parseInt(kaizenImproveSec) || 0),
                kaizenStartDate: task.kaizenStartDate || new Date().toISOString()
              })}
              className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SubtaskInput({ onAdd, onCancel }: { onAdd: (title: string) => void, onCancel: () => void }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle('');
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="ml-12 mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200"
    >
      <Plus size={16} className="text-slate-400 ml-2" />
      <input 
        autoFocus
        type="text" 
        placeholder="New sub-task..."
        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex items-center gap-1">
        <button 
          type="button"
          onClick={onCancel}
          className="p-1 text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
        <button 
          type="submit"
          disabled={!title.trim()}
          className="p-1 text-brand-600 hover:text-brand-700 disabled:opacity-50"
        >
          <CheckCircle2 size={18} />
        </button>
      </div>
    </motion.form>
  );
}

function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onToggleTimer, 
  onResetTimer,
  onEdit,
  onAddSubtask,
  isSubtask = false
}: { 
  task: Task, 
  onToggle: () => void, 
  onDelete: () => void,
  onToggleTimer: () => void,
  onResetTimer: () => void,
  onEdit: () => void,
  onAddSubtask: (title: string) => void,
  isSubtask?: boolean,
  key?: string
}) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  return (
    <>
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all ${
        task.completed ? 'bg-slate-50/50' : ''
      } ${isSubtask ? 'ml-8 sm:ml-12 border-l-4 border-l-slate-200' : ''}`}
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
            {task.isKaizen && (
              <div className="flex items-center gap-1 bg-brand-50 px-1.5 py-0.5 rounded text-brand-600 border border-brand-100">
                <Zap size={10} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Goal: {formatTime(getKaizenGoal(task))}
                </span>
              </div>
            )}
            {task.recurrence !== 'none' && (
              <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                <Repeat size={10} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {task.recurrence}
                </span>
                {task.dueDate && (
                  <span className="text-[10px] font-medium text-slate-400 ml-1 border-l border-slate-200 pl-1">
                    Next: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
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

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pl-10 sm:pl-0">
        {!task.completed && (
          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100">
            <LiveTimer task={task} />
            <div className="flex items-center gap-1">
              <button 
                onClick={onToggleTimer}
                className={`p-1 rounded-lg transition-all ${
                  task.isTimerRunning 
                    ? 'bg-brand-100 text-brand-600 hover:bg-brand-200' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {task.isTimerRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              </button>
              {task.timeSpent > 0 && (
                <button 
                  onClick={onResetTimer}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {!isSubtask && (
            <button 
              onClick={() => setIsAddingSubtask(true)}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
              title="Add Sub-task"
            >
              <Plus size={16} />
            </button>
          )}
          <button 
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
            title="Edit Task"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
    {isAddingSubtask && (
      <SubtaskInput 
        onAdd={(title) => {
          onAddSubtask(title);
          setIsAddingSubtask(false);
        }} 
        onCancel={() => setIsAddingSubtask(false)} 
      />
    )}
    </>
  );
}

function EditProjectModal({ 
  project, 
  onClose, 
  onSave 
}: { 
  project: Project, 
  onClose: () => void, 
  onSave: (updates: Partial<Project>) => void 
}) {
  const [name, setName] = useState(project.name);
  const [emoji, setEmoji] = useState(project.emoji || '📁');
  const [description, setDescription] = useState(project.description || '');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit Project</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Icon</label>
              <input 
                type="text" 
                className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
              />
              <div className="absolute left-0 top-full mt-2 p-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 hidden group-focus-within:grid grid-cols-4 gap-1 w-32">
                {SUGGESTED_EMOJIS.map(e => (
                  <button 
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-sm"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ name, emoji, description })}
              className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function KaizenView({ projects }: { projects: Project[] }) {
  const kaizenTasks = useMemo(() => {
    return projects.flatMap(p => p.tasks).filter(t => t.isKaizen);
  }, [projects]);

  const stats = useMemo(() => {
    const total = kaizenTasks.length;
    const completedToday = kaizenTasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.timeLogs.some(log => log.date === today && log.seconds >= getKaizenGoal(t));
    }).length;
    
    return { total, completedToday };
  }, [kaizenTasks]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kaizen Tracker</h2>
          <p className="text-slate-500 mt-1">Continuous improvement, one second at a time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase block">Daily Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">{stats.completedToday}/{stats.total}</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 transition-all duration-500" 
                  style={{ width: `${stats.total > 0 ? (stats.completedToday / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kaizenTasks.map(task => {
          const goal = getKaizenGoal(task);
          const today = new Date().toISOString().split('T')[0];
          const todayLog = task.timeLogs.find(log => log.date === today);
          const progress = todayLog ? (todayLog.seconds / goal) * 100 : 0;
          
          return (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <Zap size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Improvement</span>
                  <span className="text-sm font-bold text-brand-600">+{formatTime(task.kaizenDailyImprovement!)}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{task.title}</h3>
              <p className="text-xs text-slate-500 mb-6">Started on {new Date(task.kaizenStartDate!).toLocaleDateString()}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Today's Goal</span>
                    <span className="text-xl font-bold text-slate-900">{formatTime(goal)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Current</span>
                    <span className={`text-xl font-bold ${progress >= 100 ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {formatTime(todayLog?.seconds || 0)}
                    </span>
                  </div>
                </div>

                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{Math.round(progress)}% Complete</span>
                  {progress >= 100 && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> Goal Met</span>}
                </div>
              </div>
            </motion.div>
          );
        })}

        {kaizenTasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-slate-300 mb-4 shadow-sm">
              <Zap size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Kaizen Habits Yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Create a new task and enable the "Kaizen" option to start tracking your daily improvements.
            </p>
          </div>
        )}
      </div>

      {kaizenTasks.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Kaizen Report</h3>
              <p className="text-sm text-slate-500">Visualizing your continuous growth over time.</p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getKaizenReportData(kaizenTasks)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(val) => `${Math.floor(val / 60)}m`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [formatTime(val), 'Time Spent']}
                />
                <Legend iconType="circle" />
                {kaizenTasks.map((task, idx) => (
                  <Line 
                    key={task.id}
                    type="monotone" 
                    dataKey={task.title} 
                    stroke={COLORS[idx % COLORS.length]} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#white' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function getKaizenReportData(tasks: Task[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return last7Days.map(date => {
    const data: any = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    tasks.forEach(task => {
      const log = task.timeLogs.find(l => l.date === date);
      data[task.title] = log ? log.seconds : 0;
    });
    return data;
  });
}
