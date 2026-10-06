import React, { useState } from 'react';
import { Lightbulb, Eye, EyeOff, Check, Copy } from 'lucide-react';

interface HintProps {
  hint: string;
  solution: string;
  onApplySolution?: (solution: string) => void;
}

export const Hint: React.FC<HintProps> = ({ hint, solution, onApplySolution }) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            showHint
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-[#171A21] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232733] hover:bg-[#1E232E]'
          }`}
        >
          <Lightbulb className={`w-3.5 h-3.5 ${showHint ? 'text-amber-400 fill-amber-400/20' : 'text-amber-400'}`} />
          <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            showSolution
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'bg-[#171A21] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232733] hover:bg-[#1E232E]'
          }`}
        >
          {showSolution ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-sky-400" />
              <span>Hide Solution</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Show Solution</span>
            </>
          )}
        </button>
      </div>

      {/* Hint Content Box */}
      {showHint && (
        <div className="bg-[#1C1A14] border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200/90 flex items-start space-x-2.5 animate-fadeIn">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-300 mr-1">Hint:</span>
            {hint}
          </div>
        </div>
      )}

      {/* Solution Content Box */}
      {showSolution && (
        <div className="bg-[#101925] border border-sky-500/30 rounded-lg p-3 text-xs flex flex-col space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sky-300 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Model Solution:</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#172233] hover:bg-[#1f2d42] text-sky-300 text-[11px] border border-sky-700/40 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onApplySolution && (
                <button
                  type="button"
                  onClick={() => onApplySolution(solution)}
                  className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] border border-sky-500/30 transition-colors cursor-pointer font-medium"
                >
                  Load in Editor
                </button>
              )}
            </div>
          </div>
          <pre className="font-mono text-slate-200 bg-[#0C121B] p-2.5 rounded border border-sky-900/50 overflow-x-auto text-xs whitespace-pre-wrap">
            {solution}
          </pre>
        </div>
      )}
    </div>
  );
};
