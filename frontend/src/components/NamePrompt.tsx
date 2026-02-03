import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCircle2 } from 'lucide-react';

const NamePrompt = () => {
    const { userName, setUserName } = useApp();
    const [name, setName] = useState('');
    const [error, setError] = useState(false);

    if (userName) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setUserName(name.trim());
        } else {
            setError(true);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                        <UserCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-100">Welcome to weekList</h2>
                    <p className="text-neutral-500 text-sm">To get started, please tell us your name so we can personalize your experience.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Your Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(false);
                            }}
                            className={`w-full bg-neutral-950 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-indigo-500'} text-neutral-200 px-4 py-3 rounded-xl outline-none transition-all placeholder:text-neutral-600`}
                            placeholder="e.g. Ishan Roy"
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 ml-1">Please enter your name</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 mt-2"
                    >
                        Get Started
                    </button>
                    
                    <p className="text-xs text-neutral-600 text-center pt-4">
                        We save this locally on your device.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default NamePrompt;
