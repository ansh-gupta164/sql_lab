import React from 'react';
import type { Question } from '../types/sql';
import { Tag, Sparkles } from 'lucide-react';

interface QuestionHeaderProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  question,
  currentIndex,
  totalQuestions,
  isCompleted,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Meta badges */}
        <div className="flex items-center space-x-2">
          {/* Question Index Badge */}
          <span className="text-xs font-mono font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2 py-0.5 rounded-md">
            Question {currentIndex + 1} of {totalQuestions}
          </span>

          {/* Topic Badge */}
          <span className="inline-flex items-center space-x-1 text-xs text-[#94A3B8] bg-[#171A21] border border-[#232733] px-2 py-0.5 rounded-md">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{question.topic}</span>
          </span>

          {/* Difficulty Badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
              question.difficulty === 'Easy'
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
            }`}
          >
            {question.difficulty}
          </span>

          {isCompleted && (
            <span className="text-xs px-2 py-0.5 rounded-md border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Completed</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Question Title */}
      <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#F8FAFC]">
        {question.title}
      </h1>
    </div>
  );
};
