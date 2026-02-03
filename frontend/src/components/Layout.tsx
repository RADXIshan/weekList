import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NamePrompt from './NamePrompt';
import { Menu } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      <NamePrompt />
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm shrink-0 z-30">
              <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800/50 transition-colors"
              >
                  <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-3 font-semibold text-neutral-200">WeekList</h1>
          </div>

          <main className="flex-1 h-full overflow-hidden relative">
            {children}
          </main>
      </div>
    </div>
  );
};

export default Layout;
