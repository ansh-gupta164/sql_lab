import React from 'react';
import type { ExecutionResult } from '../types/sql';
import { CheckCircle2, AlertCircle, Clock, Database, ChevronRight, XCircle } from 'lucide-react';

interface ResultTableProps {
  execution: ExecutionResult;
  onNextQuestion?: () => void;
  hasNextQuestion?: boolean;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  execution,
  onNextQuestion,
  hasNextQuestion = false,
}) => {
  /* ── IDLE STATE ─────────────────────────────────────────────────── */
  if (execution.status === 'idle') {
    return (
      <div className="bg-[#171A21] border border-[#232733] rounded-lg p-6 text-center">
        <Database className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-400">Results will appear here</p>
        <p className="text-xs text-slate-500 mt-1">
          Click{' '}
          <span className="text-emerald-400 font-semibold">Run Query</span> or press{' '}
          <kbd className="font-mono bg-[#1B1F2A] border border-[#2B3142] rounded px-1 text-slate-300 text-[10px]">
            Ctrl+Enter
          </kbd>{' '}
          to execute your SQL.
        </p>
      </div>
    );
  }

  /* ── ERROR STATE ────────────────────────────────────────────────── */
  if (execution.status === 'error') {
    return (
      <div
        className="bg-[#171A21] border border-[#EF4444]/30 rounded-lg overflow-hidden"
        role="alert"
        aria-live="polite"
      >
        <div className="px-3.5 py-2.5 bg-[#EF4444]/10 border-b border-[#EF4444]/20 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-[#EF4444]">{execution.message}</p>
            {execution.errorDetail && (
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">{execution.errorDetail}</p>
            )}
          </div>
        </div>
        <div className="px-3.5 py-2 bg-[#13161E] text-[11px] text-[#94A3B8]">
          Use <span className="text-amber-400 font-medium">Show Hint</span> above if you need syntax guidance.
        </div>
      </div>
    );
  }

  /* ── SUCCESS STATE (query ran; may or may not be correct) ─────── */
  const result = execution.result;
  const isCorrect = execution.isCorrect === true;

  return (
    <div
      className="bg-[#171A21] border border-[#232733] rounded-lg overflow-hidden"
      role="region"
      aria-label="Query result"
      aria-live="polite"
    >
      {/* ── Validation Banner ──────────────────────────────────────────── */}
      <div
        className={`px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
          isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-amber-500/8 border-amber-500/20'
        }`}
      >
        {/* Left: status icon + label */}
        <div className="flex items-center space-x-2">
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          )}
          <span className={`text-xs font-semibold ${isCorrect ? 'text-emerald-400' : 'text-amber-300'}`}>
            {isCorrect
              ? '✓ Correct answer!'
              : execution.message.startsWith('✓')
              ? '✗ Query ran, but the result does not match what is expected.'
              : execution.message}
          </span>
        </div>

        {/* Right: metrics + Next button */}
        <div className="flex items-center space-x-3 text-[11px] text-[#94A3B8]">
          {execution.executionTimeMs !== undefined && (
            <div className="flex items-center space-x-1" title="Execution time">
              <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <span className="font-mono text-slate-400">{execution.executionTimeMs}ms</span>
            </div>
          )}
          {result && (
            <span className="font-mono text-slate-400">
              {result.rows.length} {result.rows.length === 1 ? 'row' : 'rows'}
            </span>
          )}
          {isCorrect && hasNextQuestion && onNextQuestion && (
            <button
              onClick={onNextQuestion}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-[#0F1117] font-semibold text-xs transition-colors cursor-pointer"
              aria-label="Go to next question"
            >
              <span>Next Question</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ── Validation Feedback (when incorrect) ──────────────────────── */}
      {!isCorrect && execution.validationFeedback && (
        <div className="px-3.5 py-2 bg-[#1B1914] border-b border-amber-900/30 text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-300">Feedback: </span>
          {execution.validationFeedback}
        </div>
      )}

      {/* ── Result Table ───────────────────────────────────────────────── */}
      {result && result.columns.length > 0 ? (
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left border-collapse text-xs" aria-label="Query output">
            <thead>
              <tr className="border-b border-[#232733] bg-[#14171F] text-[#94A3B8]">
                {result.columns.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-3.5 py-2 font-mono font-medium text-[11px] uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232733]/60 font-mono text-slate-200 text-xs">
              {result.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-[#1C202B] transition-colors odd:bg-[#171A21] even:bg-[#141720]"
                >
                  {result.columns.map((col) => (
                    <td key={col} className="px-3.5 py-2 whitespace-nowrap">
                      {row[col] === null || row[col] === undefined ? (
                        <span className="text-slate-500 italic">NULL</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        result && (
          <div className="p-4 text-center text-xs text-slate-500">
            The query ran successfully and returned 0 rows.
          </div>
        )
      )}
    </div>
  );
};
