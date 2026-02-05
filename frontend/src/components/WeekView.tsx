import React, { useState } from 'react';
import { addDays, format, isToday } from 'date-fns';
import { useApp } from '../context/AppContext';
import TaskItem from './TaskItem';
import { Plus, LayoutGrid, List, Tag, Repeat, Flag, Check } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import type { RecurringRule } from '../types';

const WeekView = () => {
  const { getTasksForDate, toggleTask, deleteTask, addTask, labels } = useApp();
  const [layout, setLayout] = useState<'list' | 'board'>('board');
  const [addingTaskDate, setAddingTaskDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // New Task State
  // New Task State
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3 | 4>(4);
  const [recurringMode, setRecurringMode] = useState<'none' | 'daily' | 'weekly'>('none');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false); // Added for recurring dropdown

  const labelDropdownRef = useClickOutside<HTMLDivElement>(() => setIsLabelOpen(false));
  const priorityDropdownRef = useClickOutside<HTMLDivElement>(() => setIsPriorityOpen(false));
  const recurringDropdownRef = useClickOutside<HTMLDivElement>(() => setIsRecurringOpen(false));

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const resetForm = () => {
      setNewTaskTitle('');
      setAddingTaskDate(null);
      setNewTaskPriority(4);
      setRecurringMode('none');
      setSelectedLabel(null);
  };

  const handleAddSubmit = (e: React.FormEvent, dateStr: string) => {
      e.preventDefault();
      if (newTaskTitle.trim()) {
          const rule: RecurringRule | undefined = recurringMode !== 'none' ? { frequency: recurringMode } : undefined;
          addTask(newTaskTitle, dateStr, rule, selectedLabel ? [selectedLabel] : [], newTaskPriority);
          resetForm();
      }
  };

  const TaskInput = ({ dateStr, autoFocus = false }: { dateStr: string, autoFocus?: boolean }) => {
      return (
        <form onSubmit={(e) => handleAddSubmit(e, dateStr)} className="mb-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 shadow-lg z-20 relative">
            <input
                id={`input-${dateStr}`}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-transparent text-neutral-200 px-2 py-1.5 rounded-lg text-sm outline-none placeholder:text-neutral-600 mb-2"
                placeholder={recurringMode !== 'none' ? `Add ${recurringMode} task...` : "Task title..."}
                autoFocus={autoFocus}
            />
            
            <div className="flex items-center gap-1 justify-between border-t border-neutral-800 pt-2">
                <div className="flex items-center gap-1">
                    {/* Label Selector */}
                    <div className="relative" ref={labelDropdownRef}>
                        <button 
                            type="button"
                            onClick={() => setIsLabelOpen(!isLabelOpen)}
                            className={`p-1.5 rounded-md transition-all ${selectedLabel ? 'text-indigo-400 bg-indigo-500/10' : 'hover:bg-neutral-800 text-neutral-500'}`}
                            title="Add Label"
                        >
                            <Tag className="w-4 h-4" />
                        </button>
                        
                        {isLabelOpen && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                    <div className="px-2 py-1 text-xs text-neutral-500 font-semibold uppercase">Select Label</div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setSelectedLabel(null);
                                            setIsLabelOpen(false);
                                        }}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                    >
                                        <span>None</span>
                                    </button>
                                    {labels.map(label => (
                                        <button 
                                            key={label}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLabel(label);
                                                setIsLabelOpen(false);
                                            }}
                                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2 ${selectedLabel === label ? 'text-indigo-400' : 'text-neutral-400'}`}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            <span className="truncate">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority Selector */}
                    <div className="relative" ref={priorityDropdownRef}>
                       <button 
                         type="button"
                         onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                         className={`p-1.5 rounded-md transition-all ${
                             newTaskPriority === 1 ? 'text-red-500 bg-red-500/10' :
                             newTaskPriority === 2 ? 'text-orange-500 bg-orange-500/10' :
                             newTaskPriority === 3 ? 'text-blue-500 bg-blue-500/10' :
                             'hover:bg-neutral-800 text-neutral-500'
                         }`}
                         title="Priority"
                      >
                         <Flag className={`w-4 h-4 ${newTaskPriority !== 4 ? 'fill-current' : ''}`} />
                      </button>

                      {isPriorityOpen && (
                          <div className="absolute left-0 top-full mt-1 w-32 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                               <div className="p-1">
                                   {[1, 2, 3, 4].map((p) => (
                                       <button 
                                           key={p}
                                           type="button"
                                           onClick={() => {
                                               setNewTaskPriority(p as 1|2|3|4);
                                               setIsPriorityOpen(false);
                                           }}
                                           className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                       >
                                           <Flag className={`w-3 h-3 ${
                                               p === 1 ? 'text-red-500 fill-current' : 
                                               p === 2 ? 'text-orange-500 fill-current' : 
                                               p === 3 ? 'text-blue-500 fill-current' : 
                                               'text-neutral-500'
                                           }`} />
                                           <span>{p === 4 ? 'None' : `P${p}`}</span>
                                           {newTaskPriority === p && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                       </button>
                                   ))}
                               </div>
                          </div>
                      )}
                    </div>

                    {/* Recurring Selector */}
                    <div className="relative" ref={recurringDropdownRef}>
                        <button 
                            type="button"
                            onClick={() => setIsRecurringOpen(!isRecurringOpen)}
                            className={`p-1.5 rounded-md transition-all ${recurringMode !== 'none' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-500'}`}
                            title="Recurring Options"
                        >
                            <Repeat className="w-4 h-4" />
                        </button>
                        
                        {isRecurringOpen && (
                            <div className="absolute left-0 top-full mt-1 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-1">
                                    <div className="px-2 py-1 text-xs text-neutral-500 font-semibold uppercase">Recurring</div>
                                    <button 
                                        type="button"
                                        onClick={() => { setRecurringMode('none'); setIsRecurringOpen(false); }}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                    >
                                        <span>No Repeat</span>
                                        {recurringMode === 'none' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRecurringMode('daily'); setIsRecurringOpen(false); }}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                    >
                                        <span>Daily</span>
                                        {recurringMode === 'daily' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRecurringMode('weekly'); setIsRecurringOpen(false); }}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                    >
                                        <span>Weekly</span>
                                        {recurringMode === 'weekly' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                        type="button"
                        onClick={resetForm}
                        className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
            </div>
        </form>
      );
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
                   {/* Add Button Top */}
                   {!isAdding && (
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
                   )}
                    
                    {isAdding && <TaskInput dateStr={dateStr} autoFocus />}

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
      <div className="shrink-0 p-4 md:p-8 pb-4 flex items-center justify-between">
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
          <div className="flex-1 overflow-x-auto min-h-0 custom-scrollbar p-4 xl:p-8 pt-0">
               <div className="flex h-full gap-4 md:gap-6 w-max min-w-full pb-4">
                   {days.map(date => (
                       <DayColumn key={date.toISOString()} date={date} />
                   ))}
               </div>
          </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pt-0 max-w-4xl mx-auto w-full space-y-8 pb-20">
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
                            {!isAdding && (
                                <button 
                                    onClick={() => {
                                        setAddingTaskDate(dateStr);
                                        setTimeout(() => document.getElementById(`input-${dateStr}`)?.focus(), 0);
                                    }}
                                    className="text-neutral-500 hover:text-indigo-400 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {isAdding && (
                            <div className="mb-4">
                                <TaskInput dateStr={dateStr} autoFocus />
                            </div>
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
