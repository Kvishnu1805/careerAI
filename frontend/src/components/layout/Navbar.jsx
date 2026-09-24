import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-x-0 border-t-0 border-b border-slate-200/80 dark:border-slate-800/80 dark:bg-slate-900/85 transition-all duration-200">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left section: Hamburger (mobile) + Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors flex-shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            )}

            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2 sm:space-x-2.5 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent truncate">
                  CareerAI
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 -mt-1 hidden xs:block sm:block truncate">
                  Interview Assistant
                </span>
              </div>
            </Link>
          </div>

          {/* Right section: Theme Toggle + User Status or Auth Links */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 hover:text-indigo-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
