import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  BrainCircuit,
  Map,
  MessageSquareCode,
  UserCheck,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Analyzer', to: '/resume', icon: FileText },
  { name: 'Career Gap Analysis', to: '/career', icon: TrendingUp },
  { name: 'AI Interview Practice', to: '/interview', icon: BrainCircuit },
  { name: 'Learning Roadmap', to: '/roadmap', icon: Map },
  { name: 'AI Career Mentor', to: '/learn', icon: MessageSquareCode },
  { name: 'Profile & Skills', to: '/profile', icon: UserCheck },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Close sidebar on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] lg:w-64 lg:top-16 lg:bottom-0 lg:z-30 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile-only Drawer Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 lg:hidden flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-sm flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent truncate">
                CareerAI
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 -mt-1 truncate">
                Navigation
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto min-h-0">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Main Features
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 flex-shrink-0 ml-1" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Target Role Mini Card */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 m-3 rounded-2xl flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Target Career</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {user?.target_role || 'Software Engineer'}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Skills logged:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {user?.skills?.length || 0}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
