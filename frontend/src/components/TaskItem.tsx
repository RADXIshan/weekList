import React from 'react';
import { Trash2, Check, Star, GripVertical, Edit2, Flag, Tag, Repeat } from 'lucide-react';
import type { Task, RecurringRule } from '../types';
import { cn } from '../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const { toggleFavorite, editTask, labels } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(task.title);
  const [editPriority, setEditPriority] = React.useState<1 | 2 | 3 | 4>(task.priority || 4);
  const [editLabels, setEditLabels] = React.useState<string[]>(task.labels || []);
  const [editIsRecurring, setEditIsRecurring] = React.useState(!!task.isRecurring);
  const [editRecurringRule, setEditRecurringRule] = React.useState<RecurringRule | undefined>(task.recurringRule);

  // Dropdown states
  const [isLabelOpen, setIsLabelOpen] = React.useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = React.useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = React.useState(false);

  const labelDropdownRef = useClickOutside<HTMLDivElement>(() => setIsLabelOpen(false));
  const priorityDropdownRef = useClickOutside<HTMLDivElement>(() => setIsPriorityOpen(false));
  const recurringDropdownRef = useClickOutside<HTMLDivElement>(() => setIsRecurringOpen(false));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  React.useEffect(() => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 4);
    setEditLabels(task.labels || []);
    setEditIsRecurring(!!task.isRecurring);
    setEditRecurringRule(task.recurringRule);
  }, [task]);

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (!editTitle.trim()) return;
        if (editIsRecurring && editRecurringRule?.frequency === 'custom' && (!editRecurringRule.daysOfWeek || editRecurringRule.daysOfWeek.length === 0)) {
          return;
        }
        editTask(task.id, {
          title: editTitle.trim(),
          priority: editPriority,
          isRecurring: editIsRecurring,
          recurringRule: editIsRecurring ? editRecurringRule : null,
          labels: editLabels
        });
        setIsEditing(false);
    } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditTitle(task.title);
        setEditPriority(task.priority || 4);
        setEditLabels(task.labels || []);
        setEditIsRecurring(!!task.isRecurring);
        setEditRecurringRule(task.recurringRule);
    }
  };

  const getRecurringText = (rule?: RecurringRule) => {
    if (!rule) return '';
    if (rule.frequency === 'daily') return 'Daily';
    if (rule.frequency === 'weekly') return 'Weekly';
    if (rule.frequency === 'custom' && rule.daysOfWeek) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Custom (${rule.daysOfWeek.map(d => dayNames[d]).join(', ')})`;
    }
    return 'Recurring';
  };

  return (
    <div 
        ref={setNodeRef}
        style={style}
        className={cn(
            "group flex flex-col gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-neutral-900/50 transition-all duration-300 border border-transparent hover:border-neutral-700",
            isEditing ? "bg-neutral-900 border-neutral-750" : "hover:bg-neutral-800",
            isDragging && "z-50 bg-neutral-800 shadow-xl border-neutral-700"
        )}
    >
      {isEditing ? (
        <div className="w-full space-y-3 text-left" onPointerDown={(e) => e.stopPropagation()}>
          {/* Title Input */}
          <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-base text-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Task title..."
              autoFocus
          />

          {/* Editors row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Priority Selector */}
            <div className="relative" ref={priorityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className={cn(
                  "p-2 rounded-lg border border-neutral-800 transition-all flex items-center gap-2 hover:bg-neutral-800",
                  editPriority === 1 ? 'text-red-500 bg-red-500/10 border-red-500/30' :
                  editPriority === 2 ? 'text-orange-500 bg-orange-500/10 border-orange-500/30' :
                  editPriority === 3 ? 'text-blue-500 bg-blue-500/10 border-blue-500/30' :
                  'text-neutral-400 bg-neutral-900'
                )}
                title="Priority"
              >
                <Flag className={cn("w-4 h-4", editPriority !== 4 && "fill-current")} />
                <span>{editPriority === 4 ? 'No Priority' : `P${editPriority}`}</span>
              </button>

              {isPriorityOpen && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-1">
                    {[1, 2, 3, 4].map((p) => {
                      const label = p === 1 ? 'High' : p === 2 ? 'Medium' : p === 3 ? 'Low' : 'None';
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setEditPriority(p as 1|2|3|4);
                            setIsPriorityOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                        >
                          <Flag className={cn("w-3.5 h-3.5", p === 1 ? "text-red-500 fill-current" : p === 2 ? "text-orange-500 fill-current" : p === 3 ? "text-blue-500 fill-current" : "text-neutral-500")} />
                          <span>{label}</span>
                          {editPriority === p && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Labels Selector (Multi-Select) */}
            <div className="relative" ref={labelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLabelOpen(!isLabelOpen)}
                className={cn(
                  "p-2 rounded-lg border border-neutral-800 transition-all flex items-center gap-2 hover:bg-neutral-800 text-neutral-400 bg-neutral-900",
                  editLabels.length > 0 && "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
                )}
                title="Labels"
              >
                <Tag className="w-4 h-4" />
                <span>{editLabels.length === 0 ? 'Labels' : `${editLabels.length} Label${editLabels.length > 1 ? 's' : ''}`}</span>
              </button>

              {isLabelOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="px-2 py-1 text-xs text-neutral-500 font-semibold uppercase">Toggle Labels</div>
                    {labels.map(label => {
                      const isSelected = editLabels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditLabels(prev => prev.filter(l => l !== label));
                            } else {
                              setEditLabels(prev => [...prev, label]);
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                        >
                          <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-indigo-500" : "bg-neutral-700")} />
                          <span className="truncate">{label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                        </button>
                      );
                    })}
                    {labels.length === 0 && (
                      <div className="px-3 py-2 text-xs text-neutral-600 italic">No labels created</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recurring Selector */}
            <div className="relative" ref={recurringDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRecurringOpen(!isRecurringOpen)}
                className={cn(
                  "p-2 rounded-lg border border-neutral-800 transition-all flex items-center gap-2 hover:bg-neutral-800 text-neutral-400 bg-neutral-900",
                  editIsRecurring && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                )}
                title="Recurring Options"
              >
                <Repeat className="w-4 h-4" />
                <span>
                  {!editIsRecurring ? 'No Repeat' : 
                   editRecurringRule?.frequency === 'daily' ? 'Daily' : 
                   editRecurringRule?.frequency === 'weekly' ? 'Weekly' : 
                   'Custom Days'}
                </span>
              </button>

              {isRecurringOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-1">
                    <div className="px-2 py-1 text-xs text-neutral-500 font-semibold uppercase">Recurring</div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIsRecurring(false);
                        setEditRecurringRule(undefined);
                        setIsRecurringOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                    >
                      <span>No Repeat</span>
                      {!editIsRecurring && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIsRecurring(true);
                        setEditRecurringRule({ frequency: 'daily' });
                        setIsRecurringOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                    >
                      <span>Daily</span>
                      {editIsRecurring && editRecurringRule?.frequency === 'daily' && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIsRecurring(true);
                        setEditRecurringRule({ frequency: 'weekly' });
                        setIsRecurringOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                    >
                      <span>Weekly</span>
                      {editIsRecurring && editRecurringRule?.frequency === 'weekly' && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIsRecurring(true);
                        setEditRecurringRule(prev => ({
                          frequency: 'custom',
                          daysOfWeek: prev?.daysOfWeek || [1, 2, 3, 4, 5] // default Mon-Fri
                        }));
                        setIsRecurringOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                    >
                      <span>Custom Days</span>
                      {editIsRecurring && editRecurringRule?.frequency === 'custom' && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Days Weekday Selector */}
          {editIsRecurring && editRecurringRule?.frequency === 'custom' && (
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Repeat on these days:</div>
              <div className="flex gap-1.5 justify-between">
                {[
                  { name: 'S', val: 0 },
                  { name: 'M', val: 1 },
                  { name: 'T', val: 2 },
                  { name: 'W', val: 3 },
                  { name: 'T', val: 4 },
                  { name: 'F', val: 5 },
                  { name: 'S', val: 6 },
                ].map(day => {
                  const isSelected = editRecurringRule.daysOfWeek?.includes(day.val);
                  return (
                    <button
                      key={day.val}
                      type="button"
                      onClick={() => {
                        const currentDays = editRecurringRule.daysOfWeek || [];
                        const nextDays = currentDays.includes(day.val)
                          ? currentDays.filter(d => d !== day.val)
                          : [...currentDays, day.val].sort();
                        setEditRecurringRule({
                          frequency: 'custom',
                          daysOfWeek: nextDays
                        });
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full text-xs font-bold transition-all border",
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 bg-neutral-900"
                      )}
                    >
                      {day.name}
                    </button>
                  );
                })}
              </div>
              {(!editRecurringRule.daysOfWeek || editRecurringRule.daysOfWeek.length === 0) && (
                <div className="text-xs text-red-400 mt-1">Please select at least one day</div>
              )}
            </div>
          )}

          {/* Actions Row */}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(task.title);
                setEditPriority(task.priority || 4);
                setEditLabels(task.labels || []);
                setEditIsRecurring(!!task.isRecurring);
                setEditRecurringRule(task.recurringRule);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editTitle.trim()) return;
                if (editIsRecurring && editRecurringRule?.frequency === 'custom' && (!editRecurringRule.daysOfWeek || editRecurringRule.daysOfWeek.length === 0)) {
                  return;
                }
                editTask(task.id, {
                  title: editTitle.trim(),
                  priority: editPriority,
                  isRecurring: editIsRecurring,
                  recurringRule: editIsRecurring ? editRecurringRule : null,
                  labels: editLabels
                });
                setIsEditing(false);
              }}
              disabled={!editTitle.trim() || (editIsRecurring && editRecurringRule?.frequency === 'custom' && (!editRecurringRule.daysOfWeek || editRecurringRule.daysOfWeek.length === 0))}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center gap-2 sm:gap-4">
          <div {...attributes} {...listeners} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 shrink-0">
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              task.completed
                ? "bg-indigo-500 border-indigo-500 text-white"
                : (
                    !task.priority || task.priority === 4 ? "border-neutral-600 hover:border-indigo-400" :
                    task.priority === 1 ? "border-red-500 bg-red-500/10 hover:bg-red-500/20" :
                    task.priority === 2 ? "border-orange-500 bg-orange-500/10 hover:bg-orange-500/20" :
                    "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                  )
            )}
          >
            <Check className={cn("w-4 h-4", task.completed ? "opacity-100" : "opacity-0")} />
          </button>

          <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "block text-base font-medium transition-all duration-300 truncate",
                  task.completed ? "text-neutral-500 line-through decoration-neutral-600" : "text-neutral-200"
                )}
                onDoubleClick={() => setIsEditing(true)}
              >
                {task.title}
              </span>
              {((task.labels && task.labels.length > 0) || (task.isRecurring && task.recurringRule)) && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                      {task.isRecurring && task.recurringRule && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 w-fit">
                              <Repeat className="w-3 h-3" />
                              {getRecurringText(task.recurringRule)}
                          </span>
                      )}
                      {task.labels?.map(label => (
                          <span key={label} className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-800">{label}</span>
                      ))}
                  </div>
              )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-neutral-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all duration-200"
            title="Edit Task"
          >
              <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(task.id)}
            className={cn(
                "p-2 rounded-lg transition-all duration-200",
                task.isFavorite ? "text-yellow-500 hover:bg-yellow-500/10" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 text-neutral-600 hover:text-yellow-500 hover:bg-yellow-500/10"
            )}
            title="Toggle Favorite"
          >
            <Star className={cn("w-5 h-5", task.isFavorite && "fill-current")} />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            aria-label="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
