import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import type { Task, RecurringRule } from '../types';

interface AppContextType {
  tasks: Task[];
  userName: string | null;
  setUserName: (name: string) => void;
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
  editTask: (
    taskId: string, 
    updates: {
      title?: string;
      priority?: 1 | 2 | 3 | 4;
      isRecurring?: boolean;
      recurringRule?: RecurringRule | null;
      labels?: string[];
    }
  ) => void;
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
  deletePrompt: { taskId: string; dateStr?: string } | null;
  setDeletePrompt: (prompt: { taskId: string; dateStr?: string } | null) => void;
  confirmDelete: (onlyThisOccurrence: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'todoist-clone-data-v2';
const USER_PROFILE_KEY = 'todoist-user-profile';

const getNextDate = (currentDate: string, rule: RecurringRule): string => {
  const date = new Date(currentDate + 'T00:00:00');
  if (rule.frequency === 'daily') {
    return format(addDays(date, rule.interval || 1), 'yyyy-MM-dd');
  }
  if (rule.frequency === 'weekly') {
     return format(addDays(date, 7), 'yyyy-MM-dd');
  }
  if (rule.frequency === 'custom' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    let next = date;
    for (let i = 0; i < 366; i++) {
      next = addDays(next, 1);
      const day = next.getDay(); // 0 is Sunday, 1 is Monday...
      if (rule.daysOfWeek.includes(day)) {
        return format(next, 'yyyy-MM-dd');
      }
    }
  }
  return format(addDays(date, 1), 'yyyy-MM-dd'); 
};

const parseTaskId = (id: string): { originalId: string; dateStr?: string } => {
  if (id.includes('__')) {
    const [originalId, dateStr] = id.split('__');
    return { originalId, dateStr };
  }
  return { originalId: id };
};

const doesRecurringTaskMatchDate = (task: Task, date: Date): boolean => {
  if (!task.isRecurring || !task.recurringRule || task.completed) return false;
  
  const targetStr = format(date, 'yyyy-MM-dd');
  const taskDateStr = task.date;
  
  if (targetStr < taskDateStr) return false;
  
  const rule = task.recurringRule;
  const targetDay = date.getDay(); // 0-6
  
  if (rule.frequency === 'daily') {
    return true;
  }
  
  if (rule.frequency === 'weekly') {
    const taskDate = new Date(taskDateStr + 'T00:00:00');
    return targetDay === taskDate.getDay();
  }
  
  if (rule.frequency === 'custom' && rule.daysOfWeek) {
    return rule.daysOfWeek.includes(targetDay);
  }
  
  return false;
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
    return initial.map(t => ({
      ...t,
      labels: t.labels || [],
      isFavorite: t.isFavorite || false,
      priority: t.priority || 4
    }));
  });

  const [userName, setUserName] = useState<string | null>(() => {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      return stored ? stored : null;
  });

  const [labels, setLabels] = useState<string[]>(() => {
    const stored = localStorage.getItem('todoist-labels');
    return stored ? JSON.parse(stored) : ['Work', 'Personal']; 
  });

  useEffect(() => {
    localStorage.setItem('todoist-labels', JSON.stringify(labels));
  }, [labels]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'dashboard' | 'filters' | 'filters-management'>('day');
  const [filterType, setFilterType] = useState<'favorites' | 'label' | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<{ taskId: string; dateStr?: string } | null>(null);

  // Persist Tasks
  useEffect(() => {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Persist User Name
  useEffect(() => {
      if (userName) {
          localStorage.setItem(USER_PROFILE_KEY, userName);
      }
  }, [userName]);

  const addTask = (title: string, date: string, recurringRule?: RecurringRule, initialLabels?: string[], priority: 1 | 2 | 3 | 4 = 4) => {
    if (!title.trim()) return;
    
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
    const { originalId, dateStr } = parseTaskId(taskId);
    setTasks(prev => {
      const task = prev.find(t => t.id === originalId);
      if (!task) return prev;
      
      if (task.parentId && task.completed) {
        const originalTask = prev.find(t => t.id === task.parentId);
        const filtered = prev.filter(t => t.id !== task.id);
        if (originalTask) {
          return filtered.map(t => {
            if (t.id === originalTask.id) {
              return {
                ...t,
                date: task.date < t.date ? task.date : t.date,
                completed: false
              };
            }
            return t;
          });
        }
        return filtered;
      }

      if (task.isRecurring && task.recurringRule && !task.completed) {
         const resolvedDateStr = dateStr || task.date;
         const historyTask: Task = {
             ...task,
             id: uuidv4(),
             completed: true,
             isRecurring: false, 
             parentId: task.id,
             date: resolvedDateStr 
         };
         
         let updatedOriginal = task;
         if (resolvedDateStr >= task.date) {
           let nextDate = getNextDate(resolvedDateStr, task.recurringRule);
           while (prev.some(t => t.parentId === task.id && t.date === nextDate && t.completed)) {
             nextDate = getNextDate(nextDate, task.recurringRule);
           }
           updatedOriginal = {
               ...task,
               date: nextDate,
               completed: false 
           };
         }
         
         return [...prev.filter(t => t.id !== originalId), updatedOriginal, historyTask];
      }

      return prev.map(t => 
        t.id === originalId ? { ...t, completed: !t.completed } : t
      );
    });
  };

  const deleteTask = (taskId: string) => {
    const { originalId, dateStr } = parseTaskId(taskId);
    const task = tasks.find(t => t.id === originalId);
    if (task && task.isRecurring && !task.parentId) {
      setDeletePrompt({ taskId, dateStr });
    } else {
      setTasks(prev => prev.filter(t => t.id !== originalId && t.parentId !== originalId));
    }
  };

  const confirmDelete = (onlyThisOccurrence: boolean) => {
    if (!deletePrompt) return;
    const { taskId, dateStr } = deletePrompt;
    const { originalId } = parseTaskId(taskId);

    if (onlyThisOccurrence) {
      setTasks(prev => {
        const task = prev.find(t => t.id === originalId);
        if (!task) return prev;
        
        const resolvedDateStr = dateStr || task.date;
        
        if (resolvedDateStr === task.date) {
          let nextDate = getNextDate(resolvedDateStr, task.recurringRule!);
          while (prev.some(t => t.parentId === task.id && t.date === nextDate && t.completed)) {
            nextDate = getNextDate(nextDate, task.recurringRule!);
          }
          return prev.map(t => {
            if (t.id === originalId) {
              return {
                ...t,
                date: nextDate
              };
            }
            return t;
          });
        } else {
          return prev.map(t => {
            if (t.id === originalId) {
              const skipped = t.skippedDates || [];
              return {
                ...t,
                skippedDates: skipped.includes(resolvedDateStr) ? skipped : [...skipped, resolvedDateStr]
              };
            }
            return t;
          });
        }
      });
    } else {
      setTasks(prev => prev.filter(t => t.id !== originalId && t.parentId !== originalId));
    }
    setDeletePrompt(null);
  };

  const editTask = (
    taskId: string, 
    updates: {
      title?: string;
      priority?: 1 | 2 | 3 | 4;
      isRecurring?: boolean;
      recurringRule?: RecurringRule | null;
      labels?: string[];
    }
  ) => {
    const { originalId } = parseTaskId(taskId);
    setTasks(prev => prev.map(t => {
      if (t.id !== originalId) return t;
      
      const title = updates.title !== undefined ? updates.title.trim() : t.title;
      if (updates.title !== undefined && !title) return t; // don't save empty title
      
      const priority = updates.priority !== undefined ? updates.priority : t.priority;
      const isRecurring = updates.isRecurring !== undefined ? updates.isRecurring : t.isRecurring;
      const recurringRule = updates.recurringRule !== undefined 
        ? (updates.recurringRule === null ? undefined : updates.recurringRule) 
        : t.recurringRule;
      const labels = updates.labels !== undefined ? updates.labels : t.labels;
      
      return {
        ...t,
        title,
        priority,
        isRecurring,
        recurringRule,
        labels
      };
    }));
  };
  
  const reorderTasks = (activeId: string, overId: string) => {
      const { originalId: activeOriginalId } = parseTaskId(activeId);
      const { originalId: overOriginalId, dateStr: overDateStr } = parseTaskId(overId);

      setTasks((items) => {
        const activeItem = items.find(i => i.id === activeOriginalId);
        if (!activeItem) return items;

        let overItem = items.find(i => i.id === overOriginalId);
        let targetDate = overItem ? (overDateStr || overItem.date) : overId;

        if (!overItem && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return items;

        const oldIndex = items.findIndex((i) => i.id === activeOriginalId);
        let newItems = [...items];
        
        const [movedItem] = newItems.splice(oldIndex, 1);
        movedItem.date = targetDate;

        let newIndex = overItem ? newItems.findIndex(i => i.id === overOriginalId) : newItems.length;
        newItems.splice(newIndex, 0, movedItem);
        
        const dateGroups: Record<string, Task[]> = {};
        newItems.forEach(item => {
            if (!dateGroups[item.date]) dateGroups[item.date] = [];
            dateGroups[item.date].push(item);
        });

        const finalItems: Task[] = [];
        Object.values(dateGroups).forEach(groupTasks => {
            groupTasks.forEach((item, index) => {
                finalItems.push({ ...item, order: index });
            });
        });

        return finalItems;
      });
  };

  const toggleFavorite = (taskId: string) => {
    const { originalId } = parseTaskId(taskId);
    setTasks(prev => prev.map(t => 
      t.id === originalId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const createLabel = (name: string) => {
    if (!name.trim() || labels.includes(name.trim())) return;
    setLabels(prev => [...prev, name.trim()]);
  };

  const deleteLabel = (name: string) => {
    setLabels(prev => prev.filter(l => l !== name));
    setTasks(prev => prev.map(t => ({
      ...t,
      labels: (t.labels || []).filter(l => l !== name)
    })));
    
    if (activeLabel === name) {
        setActiveLabel(null);
        if (filterType === 'label') {
             setFilterType(null);
             setViewMode('day'); 
        }
    }
  };

  const renameLabel = (oldName: string, newName: string) => {
    if (!newName.trim() || labels.includes(newName.trim())) return;
    const trimmedNew = newName.trim();
    
    setLabels(prev => prev.map(l => l === oldName ? trimmedNew : l));
    
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
    const { originalId } = parseTaskId(taskId);
    setTasks(prev => prev.map(t => {
      if (t.id !== originalId) return t;
      const currentLabels = t.labels || [];
      if (currentLabels.includes(label)) return t;
      return { ...t, labels: [...currentLabels, label] };
    }));
  };

  const removeLabelFromTask = (taskId: string, label: string) => {
    const { originalId } = parseTaskId(taskId);
    setTasks(prev => prev.map(t => {
      if (t.id !== originalId) return t;
      return { ...t, labels: (t.labels || []).filter(l => l !== label) };
    }));
  };

  const getTasksForDate = (date: Date) => {
      const targetStr = format(date, 'yyyy-MM-dd');
      
      const directTasks = tasks.filter(t => t.date === targetStr);
      
      const recurringTasks = tasks.filter(t => {
          if (t.date === targetStr) return false;
          return doesRecurringTaskMatchDate(t, date);
      }).filter(t => {
          const isCompleted = tasks.some(history => history.parentId === t.id && history.date === targetStr && history.completed);
          if (isCompleted) return false;
          
          const isSkipped = t.skippedDates?.includes(targetStr);
          if (isSkipped) return false;
          
          return true;
      }).map(t => ({
          ...t,
          id: `${t.id}__${targetStr}`
      }));
      
      return [...directTasks, ...recurringTasks].sort((a, b) => {
          return a.order - b.order;
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
    for (let i = 6; i >= 0; i--) {
        const d = addDays(today, -i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayTasks = getTasksForDate(d);
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
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
         const date = addDays(today, -i);
         const dateStr = format(date, 'yyyy-MM-dd');
         const hasCompletion = tasks.some(t => t.date === dateStr && t.completed);
         
         if (hasCompletion) {
             streak++;
         } else {
             if (i === 0) continue; 
             break; 
         }
    }
    return streak;
  };

  const resetMetrics = () => {
      setTasks([]);
      setLabels(['Work', 'Personal']);
      setUserName(null);
      localStorage.removeItem(USER_PROFILE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('todoist-labels');
      setSelectedDate(new Date());
  };

  return (
    <AppContext.Provider value={{
      tasks,
      userName,
      setUserName,
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
      editTask,
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
      dailProgress,
      deletePrompt,
      setDeletePrompt,
      confirmDelete
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
