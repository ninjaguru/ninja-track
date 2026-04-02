export type Priority = 'low' | 'medium' | 'high';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TimeLog {
  date: string;
  seconds: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  recurrence: Recurrence;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  timeSpent: number;
  timeLogs: TimeLog[];
  isTimerRunning: boolean;
  lastTimerStart?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: Task[];
  createdAt: string;
}
