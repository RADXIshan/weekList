import React from 'react';
import { Trash2, Check, Star } from 'lucide-react';
import type { Task } from '../types';
import { cn } from '../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const { toggleFavorite } = useApp();
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

  return (
    <div 
        ref={setNodeRef}
        style={style}
        className={cn(
            "group flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 transition-all duration-300 border border-transparent hover:border-neutral-700",
            isDragging && "z-50 bg-neutral-800 shadow-xl border-neutral-700"
        )}
    >
      <div {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400">
          <GripVertical className="w-5 h-5" />
      </div>
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          task.completed
            ? "bg-indigo-500 border-indigo-500 text-white"
            : "border-neutral-600 text-transparent hover:border-indigo-400"
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
          >
            {task.title}
          </span>
          {task.labels && task.labels.length > 0 && (
              <div className="flex gap-2 mt-1">
                  {task.labels.map(label => (
                      <span key={label} className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">{label}</span>
                  ))}
              </div>
          )}
      </div>

      <button
        onClick={() => toggleFavorite(task.id)}
        className={cn(
            "opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200",
            task.isFavorite ? "opacity-100 text-yellow-500 hover:bg-yellow-500/10" : "text-neutral-600 hover:text-yellow-500 hover:bg-yellow-500/10"
        )}
        title="Toggle Favorite"
      >
        <Star className={cn("w-5 h-5", task.isFavorite && "fill-current")} />
      </button>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
        aria-label="Delete task"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TaskItem;
