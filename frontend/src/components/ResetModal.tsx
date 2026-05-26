import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Trash2, X, RefreshCw } from 'lucide-react';

interface ResetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
    const { resetMetrics, resetProgress } = useApp();

    if (!isOpen) return null;

    const handleResetProgress = () => {
        resetProgress();
        onClose();
    };

    const handleResetEverything = () => {
        resetMetrics();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4 relative">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close dialog"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8 pr-6 pl-6">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-100 mb-2">Reset Workspace</h2>
                    <p className="text-neutral-400 text-sm max-w-md">
                        Select how you would like to reset your data. Please note that these actions are permanent and cannot be undone.
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Option 1: Reset Progress */}
                    <div className="bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                                <RotateCcw className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-100 mb-2">Reset Progress Only</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                                Uncompletes all tasks, deletes recurring task completions, and clears streaks. Your active tasks, list structure, custom labels, and profile name are preserved.
                            </p>
                        </div>
                        <button
                            onClick={handleResetProgress}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                            Reset Progress
                        </button>
                    </div>

                    {/* Option 2: Reset Everything */}
                    <div className="bg-neutral-950/40 border border-neutral-800 hover:border-red-900/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-100 mb-2">Reset Everything</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                                Deletes all tasks, resets custom labels, clears your username, and wipes all locally saved workspace settings. Restores the application to its original state.
                            </p>
                        </div>
                        <button
                            onClick={handleResetEverything}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20 cursor-pointer"
                        >
                            Delete & Reset All
                        </button>
                    </div>
                </div>

                {/* Footer Cancel */}
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-neutral-300 font-medium py-2 text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetModal;
