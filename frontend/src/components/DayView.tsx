import React, { useState } from 'react';
import { Plus, MoreHorizontal, Repeat, Tag, Flag, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskItem from './TaskItem';
import { format, isToday, isTomorrow } from 'date-fns';
import type { RecurringRule } from '../types';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DayView = () => {
  const { selectedDate, getTasksForDate, dailProgress, addTask, toggleTask, deleteTask, reorderTasks, labels } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isRecurringMode, setIsRecurringMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3 | 4>(4);
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'alpha'>('manual');

  const allTasks = getTasksForDate(selectedDate);
  const filteredByLabel = selectedLabel ? allTasks.filter(t => t.labels?.includes(selectedLabel)) : allTasks;
  const filteredByCompletion = showCompleted ? filteredByLabel : filteredByLabel.filter(t => !t.completed);
  
  const tasks = [...filteredByCompletion].sort((a, b) => {
      if (sortBy === 'priority') return (a.priority || 4) - (b.priority || 4);
      if (sortBy === 'alpha') return a.title.localeCompare(b.title);
      return a.order - b.order;
  });

  const progress = dailProgress(selectedDate);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && sortBy === 'manual') {
      reorderTasks(active.id as string, over?.id as string);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const rule: RecurringRule | undefined = isRecurringMode ? { frequency: 'daily' } : undefined;
      // We need to capture the ID of the new task to add label, but addTask currently returns void.
      // We might need to change addTask to return the ID or handle it differently.
      // For now, let's simplify: strict separation? 
      // Actually, addTask implementation in AppContext generates ID.
      // We can modify addTask to accept initial labels.
      
      // Since changing addTask signature might be risky for other components, 
      // let's update addTask to accept optional labels or just return the ID.
      // Let's assume we modify addTask signature in this same step or previous? 
      // Wait, I haven't modified addTask signature in AppContext yet.
      // Logic: I should modify AppContext.addTask to accept labels as optional arg.
      
      // Temporary fallback: we can't add label if we don't have ID.
      // Let's modify AppContext.addTask in the next step.
      // For now, I will assume addTask accepts labels as 4th arg or I will call addLabelToTask immediately?
      // But I don't have the ID.
      
      // Proper fix: Update addTask signature.
      addTask(newTaskTitle, format(selectedDate, 'yyyy-MM-dd'), rule, selectedLabel ? [selectedLabel] : [], newTaskPriority);
      
      setNewTaskTitle('');
      setIsRecurringMode(false);
      setSelectedLabel(null);
    }
  };

  const getDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEEE, MMM d');
  };

  const dateSubheader = format(selectedDate, 'MMM d');

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
            <div>
                <h2 className="text-3xl font-bold text-neutral-100 tracking-tight flex items-baseline gap-3">
                    {getDateHeader(selectedDate)}
                    <span className="text-sm font-normal text-neutral-500">{isToday(selectedDate) || isTomorrow(selectedDate) ? dateSubheader : ''}</span>
                </h2>
            </div>
            <div className="relative group">
                <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right">
                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Sort By</div>
                        <button 
                             onClick={() => setSortBy('manual')}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'manual' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Manual (Drag)</span>
                        </button>
                        <button 
                             onClick={() => setSortBy('priority')}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'priority' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Priority</span>
                        </button>
                        <button 
                             onClick={() => setSortBy('alpha')}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'alpha' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Name</span>
                        </button>
                        <div className="h-px bg-neutral-800 my-1" />
                         <button 
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                         >
                             <span>{showCompleted ? "Hide Completed" : "Show Completed"}</span>
                        </button>
                        
                        <div className="h-px bg-neutral-800 my-1" />
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filter Label</div>
                        <button 
                            onClick={() => setSelectedLabel(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!selectedLabel ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                            <span>All Tasks</span>
                        </button>
                        {labels.map(l => (
                             <button 
                                key={l}
                                onClick={() => setSelectedLabel(l)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedLabel === l ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                            >
                                {selectedLabel === l && <Check className="w-3 h-3" />}
                                <span className="truncate">{l}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {tasks.length > 0 && (
            <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                className="h-full bg-indigo-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-xs font-medium text-neutral-500 w-8 text-right">{progress}%</span>
            </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pb-20 custom-scrollbar pr-2">
         {tasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-60 text-neutral-600">
                 <div className="w-16 h-16 mb-4 rounded-2xl bg-neutral-800/50 flex items-center justify-center">
                    <img src="https://em-content.zobj.net/source/apple/391/seedling_1f331.png" alt="Seedling" className="w-8 h-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                 </div>
                 <p className="text-sm font-medium text-neutral-500">No tasks yet</p>
                 <p className="text-xs text-neutral-600 mt-1">Enjoy your day or add a task to get started</p>
             </div>
         ) : (
             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
             >
                 <SortableContext 
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                 >
                     <div className="space-y-1">
                         {tasks.map(task => (
                             <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask} 
                            />
                         ))}
                     </div>
                 </SortableContext>
             </DndContext>
         )}
                  {/* Add Task Button (Todoist Style) */}
          <form onSubmit={handleAdd} className="mt-2 group relative">
              <div className="flex items-center gap-3 px-3 py-3 text-neutral-400 group-hover:text-indigo-400 transition-colors cursor-text bg-neutral-900/50 rounded-xl border border-transparent hover:border-neutral-800">
                  <button 
                     type="submit"
                     className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-indigo-500/20 text-indigo-500 opacity-60 group-hover:opacity-100 transition-all"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
                  <input
                     id="new-task-input"
                     type="text"
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     placeholder={isRecurringMode ? "Add recurring task (Daily)..." : "Add task"}
                     className="bg-transparent border-none outline-none text-neutral-300 placeholder:text-neutral-500 flex-1 text-base font-medium"
                     autoComplete="off"
                  />
                  
                  {/* Label Selector */}
                  <div className="flex items-center gap-2">
                       {selectedLabel && (
                           <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full flex items-center gap-1">
                               {selectedLabel}
                               <button 
                                   type="button" 
                                   onClick={(e) => { e.stopPropagation(); setSelectedLabel(null); }}
                                   className="hover:text-white"
                               >
                                   ×
                               </button>
                           </span>
                       )}
                       
                       <div className="relative">
                           <button 
                                type="button"
                                onClick={() => setIsLabelOpen(!isLabelOpen)}
                                className={`p-2 rounded-md transition-all ${selectedLabel ? 'text-indigo-400' : 'hover:bg-neutral-800 text-neutral-500'}`}
                                title="Add Label"
                           >
                                <Tag className="w-5 h-5" />
                           </button>
                           
                           {isLabelOpen && (
                               <div className="absolute right-0 bottom-full mb-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                   <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                       <div className="px-2 py-1 text-xs text-neutral-500 font-semibold uppercase">Select Label</div>
                                       {labels.map(label => (
                                           <button 
                                               key={label}
                                               type="button"
                                               onClick={() => {
                                                   setSelectedLabel(label);
                                                   setIsLabelOpen(false);
                                               }}
                                               className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                           >
                                               <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                               <span>{label}</span>
                                           </button>
                                       ))}
                                       {labels.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-neutral-600 italic">No labels created</div>
                                       )}
                                   </div>
                               </div>
                           )}
                       </div>
                  </div>

                  <button 
                     type="button"
                     onClick={() => setIsRecurringMode(!isRecurringMode)}
                     className={`p-2 rounded-md transition-all ${isRecurringMode ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-500'}`}
                     title="Toggle Daily Repeat"
                  >
                     <Repeat className="w-5 h-5" />
                  </button>

                   <div className="relative">
                       <button 
                         type="button"
                         onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                         className={`p-2 rounded-md transition-all ${
                             newTaskPriority === 1 ? 'text-red-500 bg-red-500/10' :
                             newTaskPriority === 2 ? 'text-orange-500 bg-orange-500/10' :
                             newTaskPriority === 3 ? 'text-blue-500 bg-blue-500/10' :
                             'hover:bg-neutral-800 text-neutral-500'
                         }`}
                         title={`Priority ${newTaskPriority === 4 ? 'None' : newTaskPriority}`}
                      >
                         <Flag className={`w-5 h-5 ${newTaskPriority !== 4 ? 'fill-current' : ''}`} />
                      </button>

                      {isPriorityOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                               <div className="p-1">
                                   <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Priority</div>
                                   {[1, 2, 3, 4].map((p) => (
                                       <button 
                                           key={p}
                                           type="button"
                                           onClick={() => {
                                               setNewTaskPriority(p as 1|2|3|4);
                                               setIsPriorityOpen(false);
                                           }}
                                           className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                       >
                                           <Flag className={`w-4 h-4 ${
                                               p === 1 ? 'text-red-500 fill-current' : 
                                               p === 2 ? 'text-orange-500 fill-current' : 
                                               p === 3 ? 'text-blue-500 fill-current' : 
                                               'text-neutral-500'
                                           }`} />
                                           <span>{p === 4 ? 'None' : `Priority ${p}`}</span>
                                           {newTaskPriority === p && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                       </button>
                                   ))}
                               </div>
                           </div>
                      )}
                   </div>
              </div>
          </form>
      </div>
    </div>
  );
};

export default DayView;
