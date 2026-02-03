import { useApp } from '../context/AppContext';
import TaskItem from './TaskItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

const FilteredView = () => {
  const { tasks, filterType, activeLabel, toggleTask, deleteTask, reorderTasks } = useApp();

  const getFilteredTasks = () => {
    if (filterType === 'favorites') {
        return tasks.filter(t => t.isFavorite);
    }
    if (filterType === 'label' && activeLabel) {
        return tasks.filter(t => t.labels?.includes(activeLabel));
    }
    return [];
  };

  // Sort completed to bottom
  const filteredTasks = getFilteredTasks().sort((a, b) => Number(a.completed) - Number(b.completed));

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
    if (active.id !== over?.id) {
      reorderTasks(active.id as string, over?.id as string);
    }
  };

  const getHeaderTitle = () => {
      if (filterType === 'favorites') return 'Favorites';
      if (filterType === 'label') return activeLabel;
      return 'Filters';
  };
  
  const getEmptyStateMessage = () => {
      if (filterType === 'favorites') return "No favorite tasks yet";
      if (filterType === 'label') return `No tasks in " ${activeLabel} "`;
      return "No tasks found";
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-100 tracking-tight flex items-center gap-3">
             {filterType === 'favorites' && <div className="w-3 h-3 rounded-full bg-yellow-500" />}
             {filterType === 'label' && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
            {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pb-20 custom-scrollbar pr-2">
         {filteredTasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-60 text-neutral-600">
                 <div className="w-16 h-16 mb-4 rounded-2xl bg-neutral-800/50 flex items-center justify-center text-3xl">
                    {filterType === 'favorites' ? '⭐' : '🏷️'}
                 </div>
                 <p className="text-sm font-medium text-neutral-500">{getEmptyStateMessage()}</p>
                 <p className="text-xs text-neutral-600 mt-1">Add a task to this list to see it here</p>
             </div>
         ) : (
             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
             >
                 <SortableContext 
                    items={filteredTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                 >
                     <div className="space-y-1">
                         {filteredTasks.map(task => (
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
      </div>
    </div>
  );
};

export default FilteredView;
