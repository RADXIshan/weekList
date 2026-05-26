import { useApp } from '../context/AppContext';
import { Trash2 } from 'lucide-react';

const DeleteRecurringModal = () => {
    const { deletePrompt, setDeletePrompt, confirmDelete } = useApp();

    if (!deletePrompt) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Trash2 className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-100">Delete Recurring Task</h2>
                    <p className="text-neutral-400 text-sm">
                        This is a recurring task. Do you want to delete only this occurrence, or the entire recurring series?
                    </p>
                </div>

                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={() => confirmDelete(true)}
                        className="w-full bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 font-semibold py-3 rounded-xl transition-all active:scale-[0.98] border border-neutral-700/50"
                    >
                        Delete only this occurrence
                    </button>
                    <button
                        onClick={() => confirmDelete(false)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/25"
                    >
                        Delete entire series
                    </button>
                    <button
                        onClick={() => setDeletePrompt(null)}
                        className="w-full text-neutral-500 hover:text-neutral-300 font-medium py-2 mt-1 text-sm transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteRecurringModal;
