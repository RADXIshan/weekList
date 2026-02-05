import React, { useState } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
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
  const [recurringMode, setRecurringMode] = useState<'none' | 'daily' | 'weekly'>('none');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3 | 4>(4);
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'alpha'>('manual');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const moreMenuRef = useClickOutside<HTMLDivElement>(() => setIsMoreMenuOpen(false));
  const labelDropdownRef = useClickOutside<HTMLDivElement>(() => setIsLabelOpen(false));
  const priorityDropdownRef = useClickOutside<HTMLDivElement>(() => setIsPriorityOpen(false));
  const recurringDropdownRef = useClickOutside<HTMLDivElement>(() => setIsRecurringOpen(false));

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
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
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
      const rule: RecurringRule | undefined = recurringMode !== 'none' ? { frequency: recurringMode } : undefined;
      
      addTask(newTaskTitle, format(selectedDate, 'yyyy-MM-dd'), rule, selectedLabel ? [selectedLabel] : [], newTaskPriority);
      
      setNewTaskTitle('');
      setRecurringMode('none');
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
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight flex items-baseline gap-2 md:gap-3">
                    {getDateHeader(selectedDate)}
                    <span className="text-sm font-normal text-neutral-500">{isToday(selectedDate) || isTomorrow(selectedDate) ? dateSubheader : ''}</span>
                </h2>
            </div>
            <div className="relative group" ref={moreMenuRef}>
                <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors"
                >
                    <MoreHorizontal className="w-6 h-6" />
                </button>
                {/* Dropdown Menu */}
                {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl transition-all duration-200 z-50 overflow-hidden transform origin-top-right">
                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Sort By</div>
                        <button 
                             onClick={() => { setSortBy('manual'); setIsMoreMenuOpen(false); }}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'manual' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Manual (Drag)</span>
                        </button>
                        <button 
                             onClick={() => { setSortBy('priority'); setIsMoreMenuOpen(false); }}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'priority' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Priority</span>
                        </button>
                        <button 
                             onClick={() => { setSortBy('alpha'); setIsMoreMenuOpen(false); }}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${sortBy === 'alpha' ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                             <span>Name</span>
                        </button>
                        <div className="h-px bg-neutral-800 my-1" />
                         <button 
                            onClick={() => { setShowCompleted(!showCompleted); setIsMoreMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                         >
                             <span>{showCompleted ? "Hide Completed" : "Show Completed"}</span>
                        </button>
                        
                        <div className="h-px bg-neutral-800 my-1" />
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filter Label</div>
                        <button 
                            onClick={() => { setSelectedLabel(null); setIsMoreMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!selectedLabel ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                            <span>All Tasks</span>
                        </button>
                        {labels.map(l => (
                             <button 
                                key={l}
                                onClick={() => { setSelectedLabel(l); setIsMoreMenuOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedLabel === l ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                            >
                                {selectedLabel === l && <Check className="w-3 h-3" />}
                                <span className="truncate">{l}</span>
                            </button>
                        ))}
                    </div>
                </div>
                )}
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
         {/* Add Task Button (weekList Style) */}
          <form onSubmit={handleAdd} className="mt-2 group relative">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-2 sm:py-3 text-neutral-400 group-hover:text-indigo-400 transition-colors cursor-text bg-neutral-900/50 rounded-xl border border-transparent hover:border-neutral-800">
                  <button 
                     type="submit"
                     className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-indigo-500/20 text-indigo-500 opacity-60 group-hover:opacity-100 transition-all shrink-0"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
                  <input
                     id="new-task-input"
                     type="text"
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     placeholder={recurringMode !== 'none' ? `Add ${recurringMode} task...` : "Add task"}
                     className="bg-transparent border-none outline-none text-neutral-300 placeholder:text-neutral-500 flex-1 text-base font-medium min-w-[120px]"
                     autoComplete="off"
                  />
                  
                  {/* Label Selector */}
                  <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                       {selectedLabel && (
                           <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full flex items-center gap-1 max-w-[100px] truncate">
                               <span className="truncate">{selectedLabel}</span>
                               <button 
                                   type="button" 
                                   onClick={(e) => { e.stopPropagation(); setSelectedLabel(null); }}
                                   className="hover:text-white shrink-0"
                               >
                                   ×
                               </button>
                           </span>
                       )}
                       
                       <div className="relative" ref={labelDropdownRef}>
                           <button 
                                type="button"
                                onClick={() => setIsLabelOpen(!isLabelOpen)}
                                className={`p-1.5 sm:p-2 rounded-md transition-all ${selectedLabel ? 'text-indigo-400' : 'hover:bg-neutral-800 text-neutral-500'}`}
                                title="Add Label"
                           >
                                <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
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

                  <div className="relative" ref={recurringDropdownRef}>
                      <button 
                          type="button"
                          onClick={() => setIsRecurringOpen(!isRecurringOpen)}
                          className={`p-1.5 sm:p-2 rounded-md transition-all ${recurringMode !== 'none' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-500'}`}
                          title="Recurring Options"
                      >
                         <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                       {isRecurringOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                               <div className="p-1">
                                   <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Recurring</div>
                                   <button 
                                       type="button"
                                       onClick={() => { setRecurringMode('none'); setIsRecurringOpen(false); }}
                                       className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                   >
                                       <span>No Repeat</span>
                                       {recurringMode === 'none' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                   </button>
                                   <button 
                                       type="button"
                                       onClick={() => { setRecurringMode('daily'); setIsRecurringOpen(false); }}
                                       className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                   >
                                       <span>Daily</span>
                                       {recurringMode === 'daily' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                   </button>
                                   <button 
                                       type="button"
                                       onClick={() => { setRecurringMode('weekly'); setIsRecurringOpen(false); }}
                                       className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                                   >
                                       <span>Weekly</span>
                                       {recurringMode === 'weekly' && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                   </button>
                               </div>
                           </div>
                       )}
                   </div>

                   <div className="relative" ref={priorityDropdownRef}>
                       <button 
                         type="button"
                         onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                         className={`p-1.5 sm:p-2 rounded-md transition-all ${
                             newTaskPriority === 1 ? 'text-red-500 bg-red-500/10' :
                             newTaskPriority === 2 ? 'text-orange-500 bg-orange-500/10' :
                             newTaskPriority === 3 ? 'text-blue-500 bg-blue-500/10' :
                             'hover:bg-neutral-800 text-neutral-500'
                         }`}
                         title={`Priority: ${
                             newTaskPriority === 1 ? 'High' : 
                             newTaskPriority === 2 ? 'Medium' : 
                             newTaskPriority === 3 ? 'Low' : 'None'
                         }`}
                      >
                         <Flag className={`w-4 h-4 sm:w-5 sm:h-5 ${newTaskPriority !== 4 ? 'fill-current' : ''}`} />
                      </button>

                      {isPriorityOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                               <div className="p-1">
                                   <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Priority</div>
                                   {[1, 2, 3, 4].map((p) => {
                                       const label = p === 1 ? 'High' : p === 2 ? 'Medium' : p === 3 ? 'Low' : 'None';
                                       return (
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
                                           <span>{label}</span>
                                           {newTaskPriority === p && <Check className="w-3 h-3 ml-auto text-indigo-500" />}
                                       </button>
                                       );
                                   })}
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
