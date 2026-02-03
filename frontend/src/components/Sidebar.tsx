import React from 'react';
import { Calendar, LayoutList, Sun, PieChart, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';


const Sidebar = () => {
  const { selectedDate, setSelectedDate, viewMode, setViewMode, setFilterType, setActiveLabel, filterType, activeLabel, labels, createLabel } = useApp();
  const [isAddingLabel, setIsAddingLabel] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState('');

  const handleAddLabel = (e: React.FormEvent) => {
      e.preventDefault();
      if (newLabelName.trim()) {
          createLabel(newLabelName);
          setNewLabelName('');
          setIsAddingLabel(false);
      }
  };

  const navItems = [
    { 
      id: 'day', 
      label: 'Today', 
      icon: Sun, 
      color: 'text-yellow-500', 
      onClick: () => {
          setSelectedDate(new Date());
          setViewMode('day');
      }
    },
    { 
      id: 'week', 
      label: 'Week Plan', 
      icon: Calendar, 
      color: 'text-indigo-500', 
      onClick: () => setViewMode('week')
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: PieChart, 
      color: 'text-green-500', 
      onClick: () => setViewMode('dashboard')
    },
    { 
      id: 'filters-management', 
      label: 'Filters & Labels', 
      icon: LayoutList, 
      color: 'text-orange-500',
      onClick: () => setViewMode('filters-management')
    }
  ];

  return (
    <div className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col p-4">
      {/* Header Profile/Title */}
      <div className="flex items-center gap-3 mb-8 px-2">
         <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
            {(useApp().userName || 'I').charAt(0).toUpperCase()}
         </div>
         <div>
             <h1 className="text-sm font-semibold text-neutral-200">{(useApp().userName || 'My').split(' ')[0]}'s Tasks</h1>
         </div>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg text-base transition-all duration-200 flex items-center gap-3",
              (viewMode === item.id) || (item.id === 'day' && viewMode === 'day' && isToday(selectedDate))
                ? "bg-neutral-800 text-neutral-100"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
            )}
          >
            <item.icon className={cn("w-6 h-6", item.color)} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      {/* Favorites Area */}
      <div className="mt-8">
         <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2 mb-2">Favorites</h2>
         <div className="space-y-1">
             <button 
                 onClick={() => {
                     setFilterType('favorites');
                     setViewMode('filters');
                 }}
                 className={cn(
                    "w-full text-left px-3 py-3 rounded-lg text-base transition-all duration-200 flex items-center gap-2",
                    viewMode === 'filters' && filterType === 'favorites' ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:bg-neutral-800/50"
                 )}
             >
                 <div className="w-3 h-3 rounded-full bg-yellow-500" />
                 <span>All Favorites</span>
             </button>
         </div>
      </div>

      {/* Labels Area */}
      <div className="mt-8">
         <div className="flex items-center justify-between px-2 mb-2 group">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Labels</h2>
            <button 
                onClick={() => setIsAddingLabel(true)}
                className="text-neutral-600 hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Add Label"
            >
                <Plus className="w-4 h-4" />
            </button>
         </div>
         
         <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
             {labels.map(label => (
                <button 
                    key={label}
                    onClick={() => {
                        setFilterType('label');
                        setActiveLabel(label);
                        setViewMode('filters');
                    }}
                    className={cn(
                       "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2",
                       viewMode === 'filters' && filterType === 'label' && activeLabel === label ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:bg-neutral-800/50"
                    )}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <span className="truncate">{label}</span>
                </button>
             ))}
             
             {isAddingLabel && (
                 <form onSubmit={handleAddLabel} className="px-3 py-2">
                     <input 
                        type="text" 
                        autoFocus
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onBlur={() => !newLabelName && setIsAddingLabel(false)}
                        placeholder="Label name"
                        className="w-full bg-neutral-800 text-neutral-200 text-sm px-2 py-1 rounded border border-neutral-700 focus:border-indigo-500 outline-none"
                     />
                 </form>
             )}
         </div>
      </div>
    </div>
  );
};

function isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
}

export default Sidebar;
