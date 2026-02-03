import React, { useState } from 'react';
import { addDays, format, isToday, isTomorrow, startOfWeek } from 'date-fns';
import { useApp } from '../context/AppContext';
import TaskItem from './TaskItem';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const WeekView = () => {
  const { getTasksForDate, toggleTask, deleteTask, addTask } = useApp();
  const [layout, setLayout] = useState<'list' | 'board'>('board');
  const [addingTaskDate, setAddingTaskDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Start from today, or start of week? User asked for "upcoming", usually today+7
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleAddSubmit = (e: React.FormEvent, dateStr: string) => {
      e.preventDefault();
      if (newTaskTitle.trim()) {
          addTask(newTaskTitle, dateStr);
          setNewTaskTitle('');
          setAddingTaskDate(null);
      }
  };

  const DayColumn = ({ date }: { date: Date }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const tasks = getTasksForDate(date);
      const isAdding = addingTaskDate === dateStr;

      return (
          <div className="min-w-[300px] h-full flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden group/col">
               {/* Header */}
               <div className={`p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-10 
                   ${isToday(date) ? 'border-b-indigo-500/50' : ''}`}
                >
                   <div className="flex items-center justify-between mb-1">
                       <h3 className="font-semibold text-neutral-200">
                           {format(date, 'EEEE')}
                       </h3>
                       {isToday(date) && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">Today</span>}
                   </div>
                   <p className="text-sm text-neutral-500">{format(date, 'MMM d')}</p>
               </div>

               {/* Tasks */}
               <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
                   {/* Add Button Top (optional) or Bottom */}
                   <button 
                       onClick={() => {
                           setAddingTaskDate(dateStr);
                           setTimeout(() => document.getElementById(`input-${dateStr}`)?.focus(), 0);
                       }}
                       className="w-full py-2 rounded-lg border border-dashed border-neutral-800 text-neutral-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 text-sm group/btn"
                   >
                       <Plus className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                       Add Task
                   </button>
                    
                    {isAdding && (
                        <form onSubmit={(e) => handleAddSubmit(e, dateStr)} className="mb-2">
                             <input
                                id={`input-${dateStr}`}
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="w-full bg-neutral-800 text-neutral-200 px-3 py-2 rounded-lg text-sm border border-indigo-500/50 outline-none placeholder:text-neutral-600"
                                placeholder="Task title..."
                                autoFocus
                                onBlur={() => !newTaskTitle && setAddingTaskDate(null)}
                            />
                        </form>
                    )}

                   <div className="space-y-2">
                        {tasks.map(task => (
                             <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask} 
                            />
                        ))}
                   </div>
               </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      {/* View Header */}
      <div className="shrink-0 p-8 pb-4 flex items-center justify-between">
         <h2 className="text-3xl font-bold text-neutral-100 tracking-tight">Week Plan</h2>
         <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
             <button 
                onClick={() => setLayout('list')}
                className={`p-2 rounded-md transition-all ${layout === 'list' ? 'bg-neutral-800 text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
             >
                 <List className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setLayout('board')}
                className={`p-2 rounded-md transition-all ${layout === 'board' ? 'bg-neutral-800 text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'}`}
             >
                 <LayoutGrid className="w-5 h-5" />
             </button>
         </div>
      </div>

      {layout === 'board' ? (
          <div className="flex-1 overflow-x-auto min-h-0 custom-scrollbar p-8 pt-0">
               <div className="flex h-full gap-6 w-max min-w-full pb-4">
                   {days.map(date => (
                       <DayColumn key={date.toISOString()} date={date} />
                   ))}
               </div>
          </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 max-w-4xl mx-auto w-full space-y-8 pb-20">
             {days.map(date => {
                const tasks = getTasksForDate(date);
                const dateStr = format(date, 'yyyy-MM-dd');
                const isAdding = addingTaskDate === dateStr;

                return (
                    <div key={date.toISOString()} className="group">
                        <div className="flex items-center justify-between mb-2 border-b border-neutral-800 pb-2">
                             <div className="flex items-baseline gap-3">
                                <h3 className="text-base font-semibold text-neutral-200">
                                    {format(date, 'EEEE')} <span className="text-neutral-500 font-normal">{format(date, 'MMM d')}</span>
                                </h3>
                                {isToday(date) && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Today</span>}
                            </div>
                            <button 
                                onClick={() => {
                                    setAddingTaskDate(dateStr);
                                    setTimeout(() => document.getElementById(`list-input-${dateStr}`)?.focus(), 0);
                                }}
                                className="text-neutral-500 hover:text-indigo-400 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                         {isAdding && (
                            <form onSubmit={(e) => handleAddSubmit(e, dateStr)} className="mb-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        id={`list-input-${dateStr}`}
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-200 px-4 py-3 rounded-xl text-base outline-none focus:border-indigo-500/50"
                                        placeholder={`Add task for ${format(date, 'EEEE')}...`}
                                        autoFocus
                                    />
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            {tasks.length === 0 && !isAdding && (
                                <p className="text-sm text-neutral-600 italic py-2">No tasks</p>
                            )}
                            {tasks.map(task => (
                                 <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    onToggle={toggleTask} 
                                    onDelete={deleteTask} 
                                />
                            ))}
                        </div>
                    </div>
                );
             })}
        </div>
      )}
    </div>
  );
};

export default WeekView;
