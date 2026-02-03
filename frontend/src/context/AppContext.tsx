import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import type { Task, RecurringRule } from '../types';

interface AppContextType {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: 'day' | 'week' | 'dashboard' | 'filters' | 'filters-management';
  setViewMode: (mode: 'day' | 'week' | 'dashboard' | 'filters' | 'filters-management') => void;
  filterType: 'favorites' | 'label' | null;
  setFilterType: (type: 'favorites' | 'label' | null) => void;
  activeLabel: string | null;
  setActiveLabel: (label: string | null) => void;
  
  addTask: (title: string, date: string, recurringRule?: RecurringRule, initialLabels?: string[], priority?: 1 | 2 | 3 | 4) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  toggleFavorite: (taskId: string) => void;
  // Label management
  labels: string[];
  createLabel: (name: string) => void;
  deleteLabel: (name: string) => void;
  addLabelToTask: (taskId: string, label: string) => void;
  removeLabelFromTask: (taskId: string, label: string) => void;
  renameLabel: (oldName: string, newName: string) => void;
  
  // Helpers
  getTasksForDate: (date: Date) => Task[];
  dailProgress: (date: Date) => number;
  getWeeklyStats: () => { date: string; total: number; completed: number; dayName: string }[];
  getMonthlyStats: () => { name: string; completed: number }[];
  getStreak: () => number;
  resetMetrics: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'todoist-clone-data-v2'; // New key for migration safety

// --- Helper for Recurring ---
const getNextDate = (currentDate: string, rule: RecurringRule): string => {
  const date = new Date(currentDate);
  if (rule.frequency === 'daily') {
    return format(addDays(date, rule.interval || 1), 'yyyy-MM-dd');
  }
  if (rule.frequency === 'weekly') {
     // Simplification: just +7 days for now, or +1 week
     // TODO: Handle specific days of week logic later
     return format(addDays(date, 7), 'yyyy-MM-dd');
  }
  return format(addDays(date, 1), 'yyyy-MM-dd'); 
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let initial: Task[] = [];
    if (stored) {
      try {
        initial = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    // Sanitize tasks to ensure compatibility
    return initial.map(t => ({
      ...t,
      labels: t.labels || [],
      isFavorite: t.isFavorite || false,
      priority: t.priority || 4
    }));
  });
  



  const [labels, setLabels] = useState<string[]>(() => {
    const stored = localStorage.getItem('todoist-labels');
    return stored ? JSON.parse(stored) : ['Work', 'Personal']; // Defaults
  });

  useEffect(() => {
    localStorage.setItem('todoist-labels', JSON.stringify(labels));
  }, [labels]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'dashboard' | 'filters' | 'filters-management'>('day');
  const [filterType, setFilterType] = useState<'favorites' | 'label' | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // Persist
  useEffect(() => {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, date: string, recurringRule?: RecurringRule, initialLabels?: string[], priority: 1 | 2 | 3 | 4 = 4) => {
    if (!title.trim()) return;
    
    // Determine order: last in list for that date
    // (Actually simplified: just last in global list or last for that date)
    // For DND, we normally need order relative to the view.
    // Let's just use existing tasks length + 1.
    
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      completed: false,
      date: date,
      createdAt: Date.now(),
      order: tasks.length, 
      isRecurring: !!recurringRule,
      recurringRule,
      labels: initialLabels || [],
      priority
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      // Recurring logic
      if (task.isRecurring && task.recurringRule && !task.completed) {
         // Completing a recurring task:
         // 1. Create a completed history instance
         const historyTask: Task = {
             ...task,
             id: uuidv4(),
             completed: true,
             isRecurring: false, // History item is static
             parentId: task.id,
             date: task.date // Keep history on the day it was done
         };
         
         // 2. Move original task to next date
         const nextDate = getNextDate(task.date, task.recurringRule);
         const updatedOriginal = {
             ...task,
             date: nextDate,
             completed: false // Keep it open for next time
         };
         
         // Remove original, add updated + history
         return [...prev.filter(t => t.id !== taskId), updatedOriginal, historyTask];
      }

      // Normal toggle
      return prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const reorderTasks = (activeId: string, overId: string) => {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return items;
        
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        
        return newItems;
      });
  };

  const toggleFavorite = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const createLabel = (name: string) => {
    if (!name.trim() || labels.includes(name.trim())) return;
    setLabels(prev => [...prev, name.trim()]);
  };

  const deleteLabel = (name: string) => {
    setLabels(prev => prev.filter(l => l !== name));
    // Also remove from tasks
    setTasks(prev => prev.map(t => ({
      ...t,
      labels: (t.labels || []).filter(l => l !== name)
    })));
    
    // If we are currently viewing this label, switch back to day view
    if (activeLabel === name) {
        setActiveLabel(null);
        if (filterType === 'label') {
             setFilterType(null);
             setViewMode('day'); // Or fallback to filters list
        }
    }
  };

  const renameLabel = (oldName: string, newName: string) => {
    if (!newName.trim() || labels.includes(newName.trim())) return;
    const trimmedNew = newName.trim();
    
    setLabels(prev => prev.map(l => l === oldName ? trimmedNew : l));
    
    // Update tasks
    setTasks(prev => prev.map(t => ({
        ...t,
        labels: (t.labels || []).map(l => l === oldName ? trimmedNew : l)
    })));

    if (activeLabel === oldName) {
        setActiveLabel(trimmedNew);
    }
  };

  const addLabelToTask = (taskId: string, label: string) => {
    if (!labels.includes(label)) {
        createLabel(label);
    }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const currentLabels = t.labels || [];
      if (currentLabels.includes(label)) return t;
      return { ...t, labels: [...currentLabels, label] };
    }));
  };

  const removeLabelFromTask = (taskId: string, label: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, labels: (t.labels || []).filter(l => l !== label) };
    }));
  };

  const getTasksForDate = (date: Date) => {
      const targetStr = format(date, 'yyyy-MM-dd');
      return tasks
        .filter(t => t.date === targetStr)
        .sort(() => {
             // Basic sort: incomplete first, then completed? 
             // Or maintain order?
             // Since we have 'reorderTasks', let's trust array order for now.
             // But usually completed go to bottom.
             // Let's rely on array order (user sort) primarily.
             return 0;
        });
  };
  
  const dailProgress = (date: Date) => {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length === 0) return 0;
      const completed = dayTasks.filter(t => t.completed).length;
      return Math.round((completed / dayTasks.length) * 100);
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const stats = [];
    // Last 7 days including today? Or current week? Let's do last 7 days for trend
    for (let i = 6; i >= 0; i--) {
        const d = addDays(today, -i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.date === dateStr);
        stats.push({
            date: dateStr,
            dayName: format(d, 'EEE'),
            total: dayTasks.length,
            completed: dayTasks.filter(t => t.completed).length
        });
    }
    return stats;
  };

  const getMonthlyStats = () => {
      // Simplified: Just showing total completed tasks per month for the current year
      // This is a bit heavy if there are many tasks, but fine for local MVP
      const currentYear = new Date().getFullYear();
      const stats = Array.from({ length: 12 }, (_, i) => ({
          name: format(new Date(currentYear, i, 1), 'MMM'),
          completed: 0
      }));

      tasks.forEach(t => {
          const d = new Date(t.date);
          if (d.getFullYear() === currentYear && t.completed) {
              stats[d.getMonth()].completed++;
          }
      });
      return stats;
  };

  const getStreak = () => {
    // Basic streak calculation: consecutive days ending today or yesterday where >= 1 task was completed
    let streak = 0;
    const today = new Date();
    // Check up to 365 days back
    for (let i = 0; i < 365; i++) {
         const date = addDays(today, -i);
         const dateStr = format(date, 'yyyy-MM-dd');
         // If i=0 (today) and no tasks completed yet, don't break streak if yesterday was completed
         // But if today has completion, streak++
         const hasCompletion = tasks.some(t => t.date === dateStr && t.completed);
         
         if (hasCompletion) {
             streak++;
         } else {
             if (i === 0) continue; // Skip today if incomplete, check yesterday
             break; // Gap found
         }
    }
    return streak;
  };

  const resetMetrics = () => {
      setTasks([]);
      setLabels(['Work', 'Personal']);
      setSelectedDate(new Date());
  };

  return (
    <AppContext.Provider value={{
      tasks,
      selectedDate,
      setSelectedDate,
      viewMode,
      setViewMode,
      filterType,
      setFilterType,
      activeLabel,
      setActiveLabel,
      addTask,
      toggleTask,
      deleteTask,
      reorderTasks,
      toggleFavorite,
      getWeeklyStats,
      getMonthlyStats,
      labels,
      createLabel,
      deleteLabel,
      renameLabel,
      addLabelToTask,
      removeLabelFromTask,
      getStreak,
      resetMetrics,
      getTasksForDate,
      dailProgress
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
