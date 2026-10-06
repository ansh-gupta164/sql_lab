import React from 'react';
import type { Question, DatabaseSchema } from '../types/sql';
import { QuestionHeader } from './QuestionHeader';
import { DatabasePreview } from './DatabasePreview';
import { Hint } from './Hint';

interface QuestionPanelProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  database: DatabaseSchema;
  onApplySolution: (sol: string) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  currentIndex,
  totalQuestions,
  isCompleted,
  database,
  onApplySolution,
}) => {
  return (
    <div className="space-y-4">
      {/* Question Header */}
      <QuestionHeader
        question={question}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        isCompleted={isCompleted}
      />

      {/* Question Description */}
      <div className="bg-[#171A21] border border-[#232733] rounded-lg p-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
          Task Description
        </h2>
        <p className="text-sm text-[#F8FAFC] leading-relaxed">
          {question.description}
        </p>
      </div>

      {/* Hint & Solution */}
      <Hint
        hint={question.hint}
        solution={question.solution}
        onApplySolution={onApplySolution}
      />

      {/* Database Preview */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center justify-between">
          <span>Active Database Schema</span>
          <span className="text-[11px] font-mono text-slate-500">college_db.{question.targetTable}</span>
        </div>
        <DatabasePreview
          database={database}
          defaultTableName={question.targetTable}
        />
      </div>
    </div>
  );
};
