import React, { useState } from 'react';
import {
  ShieldAlert,
  SearchCheck,
  LayoutDashboard,
  History,
  BookOpen,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <SearchCheck className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Truth<span className="text-teal-400">Lens</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider -mt-1 hidden sm:block">
                Credibility & Fact Verification
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('analyze')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'analyze'
                  ? 'bg-indigo-600/30 text-teal-300 border border-teal-500/40 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles size={15} className="text-teal-400" />
              Analyze News
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentView === 'dashboard'
                      ? 'bg-slate-800 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNav('history')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentView === 'history'
                      ? 'bg-slate-800 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History size={15} />
                  History
                </button>
              </>
            )}

            <button
              onClick={() => handleNav('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'about'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen size={15} />
              Methodology & UML
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-600/50'
                    : 'text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <Shield size={15} />
                Admin
              </button>
            )}
          </nav>

          {/* User / Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/80">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-sm px-1 font-semibold uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('analyze')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-teal-300 font-semibold hover:bg-slate-800 flex items-center gap-2"
          >
            <Sparkles size={16} />
            Analyze News
          </button>
          {user && (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={() => handleNav('history')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <History size={16} />
                Analysis History
              </button>
            </>
          )}
          <button
            onClick={() => handleNav('about')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <BookOpen size={16} />
            Methodology & UML
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <Shield size={16} />
              Admin Center
            </button>
          )}

          <div className="pt-3 border-t border-slate-800 mt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-slate-400">Signed in as {user.name}</span>
                <button
                  onClick={() => logout()}
                  className="text-xs text-rose-400 font-medium flex items-center gap-1"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleNav('auth')}
                  className="flex-1 py-2 text-center text-xs font-semibold bg-teal-500 text-slate-950 rounded-lg"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
