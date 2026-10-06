import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface QuestionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  completedIndices: Set<number>;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSelectIndex,
  completedIndices,
}) => {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalQuestions - 1;
  const percent = Math.round((completedIndices.size / totalQuestions) * 100);

  return (
    <nav
      className="bg-[#171A21] border border-[#232733] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3"
      aria-label="Question navigation"
    >
      {/* Progress & Question Info */}
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300">
            Question {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-[11px] text-[#94A3B8] hidden md:inline">
            ({completedIndices.size} solved)
          </span>
        </div>

        {/* Mini progress bar */}
        <div
          className="w-24 bg-[#0F1117] h-1.5 rounded-full overflow-hidden border border-[#232733]"
          role="progressbar"
          aria-valuenow={completedIndices.size}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-label={`${completedIndices.size} of ${totalQuestions} questions solved`}
        >
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Numerical pill navigation (desktop/tablet only) */}
      <div className="hidden lg:flex items-center space-x-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isDone = completedIndices.has(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              aria-label={`Go to question ${idx + 1}${isDone ? ' (completed)' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={`w-7 h-7 rounded text-xs font-mono transition-colors flex items-center justify-center cursor-pointer ${
                isCurrent
                  ? 'bg-sky-500 text-slate-950 font-bold ring-2 ring-sky-400/30'
                  : isDone
                  ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-[#1D212B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232733] hover:border-slate-500'
              }`}
            >
              {isDone && !isCurrent ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : idx + 1}
            </button>
          );
        })}
      </div>

      {/* Prev / Next buttons */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Go to previous question"
          className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1B1F2A] border border-[#2B3142] transition-colors ${
            hasPrevious
              ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#232938] cursor-pointer'
              : 'text-[#4A5568] opacity-40 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Go to next question"
          className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            hasNext
              ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50 cursor-pointer'
              : 'text-emerald-700 bg-emerald-950/20 border-emerald-900/30 opacity-40 cursor-not-allowed'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
