import React, { useState, useEffect } from 'react';
import type { SQLTopic, ExecutionResult } from '../types/sql';
import { questions } from '../data/questions';
import { collegeDatabase } from '../data/database';
import { runAndValidateQuery } from '../services/sqlEngine';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { QuestionPanel } from '../components/QuestionPanel';
import { SQLEditor } from '../components/SQLEditor';
import { ResultTable } from '../components/ResultTable';
import { QuestionNavigation } from '../components/QuestionNavigation';
import { Menu } from 'lucide-react';

const TOPICS: SQLTopic[] = [
  'SQL Basics',
  'SELECT',
  'WHERE',
  'ORDER BY',
  'GROUP BY',
  'JOIN',
];

const STORAGE_KEYS = {
  COMPLETED: 'sql-lab:v1:progress',
  CURRENT_INDEX: 'sql-lab:v1:current-question',
  DRAFTS: 'sql-lab:v1:drafts',
};

export const PracticePage: React.FC = () => {
  // Initialize current index from localStorage
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const savedIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
      if (savedIndex !== null) {
        const parsed = parseInt(savedIndex, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < questions.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved question index from localStorage', e);
    }
    return 0;
  });

  // Initialize completed questions from localStorage
  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read completed questions from localStorage', e);
    }
    return new Set<number>();
  });

  // User drafts map
  const [drafts, setDrafts] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read query drafts from localStorage', e);
    }
    return {};
  });

  const currentQuestion = questions[currentIndex];
  const [selectedTopic, setSelectedTopic] = useState<SQLTopic>(currentQuestion.topic);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Editor code state: draft if exists, else starter query
  const [userQuery, setUserQuery] = useState<string>(
    drafts[currentQuestion.id] ?? currentQuestion.starterQuery
  );

  // Query Execution result state
  const [executionResult, setExecutionResult] = useState<ExecutionResult>({
    status: 'idle',
    message: '',
  });

  // When question changes: sync topic, restore correct draft, clear result, persist index
  useEffect(() => {
    setSelectedTopic(currentQuestion.topic);
    // Restore question-specific draft, never bleed another question's query
    const existingDraft = drafts[currentQuestion.id];
    setUserQuery(existingDraft !== undefined ? existingDraft : currentQuestion.starterQuery);
    setExecutionResult({ status: 'idle', message: '' });
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentIndex.toString());
    } catch (e) {
      // localStorage unavailable (private browsing etc.) — degrade gracefully
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Persist solved question IDs whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(Array.from(completedQuestionIds)));
    } catch (e) {
      // Silently degrade on storage errors
    }
  }, [completedQuestionIds]);

  /** Persist draft to localStorage whenever the user types */
  const handleQueryChange = (text: string) => {
    setUserQuery(text);
    setDrafts((prev) => {
      const updated = { ...prev, [currentQuestion.id]: text };
      try {
        localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updated));
      } catch (e) {
        // Silently degrade
      }
      return updated;
    });
  };

  // Execute query against real in-browser SQL engine and validate result
  const handleRunQuery = () => {
    setIsRunning(true);
    // Slight tick to allow UI loading state
    setTimeout(() => {
      const result = runAndValidateQuery(userQuery, currentQuestion);
      setExecutionResult(result);
      setIsRunning(false);

      if (result.isCorrect) {
        setCompletedQuestionIds((prev) => new Set([...prev, currentQuestion.id]));
      }
    }, 40);
  };

  /**
   * Restore the starter query for the current question.
   * Clears the current execution result but does NOT erase overall progress.
   */
  const handleResetQuery = () => {
    setUserQuery(currentQuestion.starterQuery);
    setExecutionResult({ status: 'idle', message: '' });
    setDrafts((prev) => {
      const updated = { ...prev, [currentQuestion.id]: currentQuestion.starterQuery };
      try { localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updated)); } catch (_) { /* ignore */ }
      return updated;
    });
  };

  /** Wipe the editor contents completely. Does NOT reset to starter — just clears. */
  const handleClearQuery = () => {
    setUserQuery('');
    setExecutionResult({ status: 'idle', message: '' });
    setDrafts((prev) => {
      const updated = { ...prev, [currentQuestion.id]: '' };
      try { localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updated)); } catch (_) { /* ignore */ }
      return updated;
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectQuestionById = (id: number) => {
    const foundIndex = questions.findIndex((q) => q.id === id);
    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
    }
  };

  const handleSelectIndex = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
    }
  };

  // Completed indices for navigation bar
  const completedIndices = new Set(
    Array.from(completedQuestionIds).map((id) => questions.findIndex((q) => q.id === id))
  );

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        completedCount={completedQuestionIds.size}
        totalCount={questions.length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          topics={TOPICS}
          selectedTopic={selectedTopic}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
          questions={questions}
          currentQuestionId={currentQuestion.id}
          onSelectQuestion={handleSelectQuestionById}
          completedQuestionIds={completedQuestionIds}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4">
          {/* Mobile Toolbar */}
          <div className="md:hidden flex items-center justify-between bg-[#171A21] border border-[#232733] p-2.5 rounded-lg">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Browse Topics & Questions</span>
            </button>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Q{currentQuestion.id}/{questions.length}
            </span>
          </div>

          {/* Top Question Navigation Bar */}
          <QuestionNavigation
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSelectIndex={handleSelectIndex}
            completedIndices={completedIndices}
          />

          {/* Two-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Question Details & Ready-Made Database Preview */}
            <div className="lg:col-span-5 space-y-4">
              <QuestionPanel
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                isCompleted={completedQuestionIds.has(currentQuestion.id)}
                database={collegeDatabase}
                onApplySolution={(sol) => handleQueryChange(sol)}
              />
            </div>

            {/* Right Column: SQL Editor & Result Area */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center justify-between">
                  <span>SQL Playground</span>
                  <span className="text-[11px] font-mono text-slate-400 bg-[#171A21] px-2 py-0.5 rounded border border-[#232733]">
                    Browser SQL Engine
                  </span>
                </div>
                <SQLEditor
                  value={userQuery}
                  onChange={handleQueryChange}
                  onRun={handleRunQuery}
                  onReset={handleResetQuery}
                  onClear={handleClearQuery}
                  isRunning={isRunning}
                />
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Execution Output
                </div>
                <ResultTable
                  execution={executionResult}
                  onNextQuestion={handleNext}
                  hasNextQuestion={currentIndex < questions.length - 1}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
