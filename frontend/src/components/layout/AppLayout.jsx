import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 overflow-x-hidden">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex w-full min-w-0">
        {/* Responsive Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 lg:pl-64 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
