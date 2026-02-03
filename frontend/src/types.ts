export type RecurringFrequency = 'daily' | 'weekly' | 'custom';

export interface RecurringRule {
  frequency: RecurringFrequency;
  interval?: number; // e.g., every 2 days
  daysOfWeek?: number[]; // 0-6 (Sun-Sat) for weekly
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  createdAt: number;
  order: number;
  
  // Recurring logic
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
  parentId?: string; // If this is an instance of a recurring task, point to the original

  // Organization
  labels?: string[];
  isFavorite?: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  tasks: Task[];
}
