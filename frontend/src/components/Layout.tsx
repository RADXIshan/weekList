import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
