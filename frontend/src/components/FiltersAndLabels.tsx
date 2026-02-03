import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Trash2, Edit2, Check, X, Plus } from 'lucide-react';


const FiltersAndLabels = () => {
  const { labels, tasks, deleteLabel, renameLabel, setFilterType, setActiveLabel, setViewMode, createLabel } = useApp();
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getTaskCount = (label: string) => {
    return tasks.filter(t => t.labels?.includes(label) && !t.completed).length;
  };

  const startEditing = (label: string) => {
    setEditingLabel(label);
    setEditName(label);
  };

  const saveEdit = () => {
    if (editingLabel && editName.trim()) {
        renameLabel(editingLabel, editName);
        setEditingLabel(null);
    }
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setEditName('');
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-100 tracking-tight">Filters & Labels</h2>
        <p className="text-neutral-500 mt-2">Manage your tags and organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Labels Section */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                Labels
            </h3>
            
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('newLabel') as HTMLInputElement;
                    if (input.value.trim()) {
                        createLabel(input.value.trim()); 
                        input.value = '';
                    }
                }}
                className="mb-4 flex gap-2"
            >
                <input 
                    name="newLabel"
                    type="text" 
                    placeholder="New label name..." 
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>
            
            <div className="space-y-2">
                {labels.length === 0 ? (
                    <p className="text-neutral-500 text-sm italic">No labels created yet.</p>
                ) : (
                    labels.map(label => (
                        <div key={label} className="group flex items-center justify-between p-3 rounded-xl bg-neutral-800/30 hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-700">
                            {editingLabel === label ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 bg-neutral-900 border border-indigo-500/50 rounded-lg px-2 py-1 text-sm text-neutral-100 outline-none"
                                        autoFocus
                                    />
                                    <button onClick={saveEdit} className="p-1 hover:bg-green-500/20 text-green-500 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={cancelEdit} className="p-1 hover:bg-red-500/20 text-red-500 rounded"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <>
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => {
                                            setFilterType('label');
                                            setActiveLabel(label);
                                            setViewMode('filters');
                                        }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <span className="text-neutral-200 font-medium">{label}</span>
                                        <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full">
                                            {getTaskCount(label)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEditing(label)}
                                            className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (confirm(`Delete label "${label}"?`)) {
                                                    deleteLabel(label);
                                                }
                                            }}
                                            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersAndLabels;
