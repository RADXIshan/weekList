import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteLabelModalProps {
    label: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteLabelModal: React.FC<DeleteLabelModalProps> = ({ label, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
                        <Trash2 className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-100">Delete Label</h2>
                    <p className="text-neutral-400 text-sm">
                        Are you sure you want to delete the label <span className="font-semibold text-neutral-200">"{label}"</span>?
                    </p>
                    <p className="text-neutral-500 text-xs">
                        This will remove the label from all tasks. The tasks themselves will not be deleted.
                    </p>
                </div>

                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/25 cursor-pointer"
                    >
                        Delete Label
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 font-semibold py-3 rounded-xl transition-all active:scale-[0.98] border border-neutral-700/50 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteLabelModal;
