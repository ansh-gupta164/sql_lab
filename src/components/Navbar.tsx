import React from 'react';
import { Database, Terminal, CheckCircle2, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  completedCount: number;
  totalCount: number;
  onSelectTopic?: (topic: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ completedCount, totalCount }) => {
  return (
    <header className="h-14 border-b border-[#232733] bg-[#12151D] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand */}
      <div className="flex items-center space-x-6">
        <a href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold tracking-tight text-white text-base">SQL Lab</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              v1.0
            </span>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden sm:flex items-center space-x-1">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-[#94A3B8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progress:</span>
            <span className="font-mono text-[#F8FAFC] font-semibold">
              {completedCount}/{totalCount}
            </span>
          </div>
        </nav>
      </div>

      {/* Right: Actions & User Placeholder */}
      <div className="flex items-center space-x-3">
        {/* Progress pill for mobile */}
        <div className="sm:hidden flex items-center space-x-1 text-xs bg-[#171A21] px-2.5 py-1 rounded-md border border-[#232733] text-[#94A3B8]">
          <span className="font-mono text-emerald-400 font-bold">{completedCount}</span>
          <span>/</span>
          <span>{totalCount}</span>
        </div>

        {/* Zero-setup badge */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#94A3B8] bg-[#171A21] px-2.5 py-1 rounded-md border border-[#232733]">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Zero Setup • In-Browser Database</span>
        </div>

        {/* Login placeholder */}
        <button
          type="button"
          aria-label="Student profile login"
          onClick={() => alert('Authentication is disabled for V1. You can freely practice without logging in!')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#171A21] hover:bg-[#1E232E] border border-[#232733] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Login</span>
        </button>
      </div>
    </header>
  );
};
