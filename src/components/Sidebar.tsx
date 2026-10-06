import React from 'react';
import type { SQLTopic, Question } from '../types/sql';
import { BookOpen, CheckCircle, Layers } from 'lucide-react';

interface SidebarProps {
  topics: SQLTopic[];
  selectedTopic: SQLTopic;
  onSelectTopic: (topic: SQLTopic) => void;
  questions: Question[];
  currentQuestionId: number;
  onSelectQuestion: (questionId: number) => void;
  completedQuestionIds: Set<number>;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topics,
  selectedTopic,
  onSelectTopic,
  questions,
  currentQuestionId,
  onSelectQuestion,
  completedQuestionIds,
  isOpen,
  onCloseMobile,
}) => {
  // Questions belonging to the selected topic
  const questionsInSelectedTopic = questions.filter((q) => q.topic === selectedTopic);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-20 w-64 md:w-60 lg:w-64 bg-[#12151D] border-r border-[#232733] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#232733] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>SQL Curriculum</span>
          </div>
          <span className="text-[10px] bg-[#171A21] border border-[#232733] px-1.5 py-0.5 rounded text-[#94A3B8]">
            {topics.length} Topics
          </span>
        </div>

        {/* Topic List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <div className="text-[11px] font-medium text-[#94A3B8] px-2 mb-2 uppercase tracking-wider">
              Topic Progression
            </div>
            <div className="space-y-1">
              {topics.map((topic) => {
                const isSelected = topic === selectedTopic;
                const topicQuestions = questions.filter((q) => q.topic === topic);
                const completedInTopic = topicQuestions.filter((q) =>
                  completedQuestionIds.has(q.id)
                ).length;
                const isFullyComplete = topicQuestions.length > 0 && completedInTopic === topicQuestions.length;

                return (
                  <button
                    key={topic}
                    onClick={() => {
                      onSelectTopic(topic);
                      const firstInTopic = questions.find((q) => q.topic === topic);
                      if (firstInTopic && questions.find(q => q.id === currentQuestionId)?.topic !== topic) {
                        onSelectQuestion(firstInTopic.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171A21] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-[#33394A]'}`} />
                      <span className="truncate">{topic}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isFullyComplete && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isFullyComplete
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                            : completedInTopic > 0
                            ? 'bg-sky-950/40 border-sky-800/40 text-sky-400'
                            : 'bg-[#171A21] border-[#232733] text-slate-400'
                        }`}
                      >
                        {completedInTopic}/{topicQuestions.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions in active topic */}
          <div>
            <div className="text-[11px] font-medium text-[#94A3B8] px-2 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>{selectedTopic} Questions</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {questionsInSelectedTopic.length} {questionsInSelectedTopic.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div className="space-y-1">
              {questionsInSelectedTopic.map((q) => {
                const isActive = q.id === currentQuestionId;
                const isCompleted = completedQuestionIds.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1D222D] text-[#F8FAFC] border border-[#38BDF8]/40 shadow-xs'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171A21] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-1">
                      <span className={`text-[11px] font-mono shrink-0 ${isActive ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}>
                        Q{q.id}.
                      </span>
                      <span className="truncate">{q.title}</span>
                    </div>

                    <div className="shrink-0 flex items-center space-x-1">
                      {isCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-medium ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                            : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-[#232733] bg-[#0F1117]/50 text-[11px] text-[#94A3B8] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database:</span>
          </div>
          <span className="font-mono text-slate-300 font-medium">college_db (4 tables)</span>
        </div>
      </aside>
    </>
  );
};
