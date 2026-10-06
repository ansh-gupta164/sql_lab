import React, { useRef } from 'react';
import { Play, RotateCcw, Trash2, Code2 } from 'lucide-react';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onClear: () => void;
  isRunning?: boolean;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRun,
  onReset,
  onClear,
  isRunning = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate line numbers
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 6);

  // Handle keyboard shortcuts: Cmd/Ctrl + Enter to run, Tab for 2 spaces indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  ';

      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);

      // Restore cursor position after the 2 spaces
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      });
    }
  };

  return (
    <div className="bg-[#171A21] border border-[#232733] rounded-lg overflow-hidden flex flex-col focus-within:border-emerald-500/50 transition-colors shadow-sm">
      {/* Editor Header Bar */}
      <div className="px-3 py-2 bg-[#14171F] border-b border-[#232733] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">SQL Query Editor</span>
        </div>

        {/* Quick actions: Reset & Clear */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onReset}
            title="Reset to starter query"
            className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E232E] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear editor"
            className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#1E232E] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex font-mono text-xs md:text-sm bg-[#111319] min-h-[160px] md:min-h-[190px]">
        {/* Line Numbers gutter */}
        <div className="select-none py-3 px-2 text-right text-slate-600 bg-[#0E1017] border-r border-[#232733] min-w-[36px] font-mono text-xs">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          placeholder="-- Write your SQL query here..."
          className="flex-1 py-3 px-3 bg-transparent text-[#F8FAFC] font-mono text-xs md:text-sm leading-6 resize-y focus:outline-none placeholder-slate-600 selection:bg-emerald-500/30 min-h-[160px]"
        />
      </div>

      {/* Editor Footer: Controls & Run Query */}
      <div className="px-3 py-2 bg-[#14171F] border-t border-[#232733] flex items-center justify-between">
        <div className="flex items-center space-x-1 text-[11px] text-[#94A3B8]">
          <span className="hidden sm:inline">Press</span>
          <kbd className="px-1.5 py-0.5 bg-[#1B1F2A] border border-[#2B3142] rounded text-[10px] text-slate-300 font-mono">
            Ctrl
          </kbd>
          <span className="text-slate-500">+</span>
          <kbd className="px-1.5 py-0.5 bg-[#1B1F2A] border border-[#2B3142] rounded text-[10px] text-slate-300 font-mono">
            Enter
          </kbd>
          <span className="hidden sm:inline text-slate-400">to execute</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-500">Tab for indent</span>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#22C55E] hover:bg-[#1ea34d] active:scale-[0.98] text-[#0A2612] transition-all cursor-pointer shadow-sm hover:shadow-emerald-900/30 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
        </button>
      </div>
    </div>
  );
};
