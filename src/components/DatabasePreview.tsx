import React, { useState } from 'react';
import type { DatabaseSchema, TableSchema } from '../types/sql';
import { Database, Table, KeyRound, Link2, ChevronDown, ChevronRight } from 'lucide-react';

interface DatabasePreviewProps {
  database: DatabaseSchema;
  defaultTableName?: string;
}

export const DatabasePreview: React.FC<DatabasePreviewProps> = ({
  database,
  defaultTableName = 'students',
}) => {
  const [selectedTableName, setSelectedTableName] = useState<string>(defaultTableName);
  const [showExplorerTree, setShowExplorerTree] = useState<boolean>(false);

  // Sync with defaultTableName if parent sets it
  const currentTable: TableSchema =
    database.tables.find((t) => t.name === selectedTableName) || database.tables[0];

  return (
    <div className="bg-[#171A21] border border-[#232733] rounded-lg overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-3 py-2.5 bg-[#14171F] border-b border-[#232733] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#232733] text-emerald-400">
            <Database className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => setShowExplorerTree(!showExplorerTree)}
            className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle database explorer view"
          >
            <span>{database.name}</span>
            {showExplorerTree ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )}
          </button>
          <span className="text-slate-600">/</span>
          <div className="flex items-center space-x-1">
            <Table className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-mono text-sky-300 font-medium">{currentTable.name}</span>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          {database.tables.map((t) => (
            <button
              key={t.name}
              onClick={() => setSelectedTableName(t.name)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 cursor-pointer ${
                currentTable.name === t.name
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-[#1D212B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232733]'
              }`}
            >
              {t.name} <span className="opacity-60 text-[10px]">({t.rows.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Schema & Relationships tree drawer if toggled */}
      {showExplorerTree && (
        <div className="bg-[#10131A] px-3 py-2.5 border-b border-[#232733] text-xs font-mono text-[#94A3B8] space-y-1.5 animate-fadeIn">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
            <span>Relational Schema Tree:</span>
          </div>
          <div className="pl-2 space-y-1 text-[11px] text-slate-300">
            <div>
              <span className="text-emerald-400">college_db</span>
            </div>
            {database.tables.map((t, idx) => {
              const isLast = idx === database.tables.length - 1;
              const isSelected = t.name === currentTable.name;

              return (
                <div
                  key={t.name}
                  onClick={() => setSelectedTableName(t.name)}
                  className={`pl-3 cursor-pointer hover:text-white transition-colors flex items-center space-x-1.5 ${
                    isSelected ? 'text-sky-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span className="text-slate-600">{isLast ? '└──' : '├──'}</span>
                  <span>{t.name}</span>
                  <span className="text-slate-500 text-[10px]">
                    ({t.columns.length} cols, {t.rows.length} rows)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schema / Columns list with types and foreign key relationships */}
      <div className="px-3 py-2 bg-[#12151D] border-b border-[#232733]/60 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-[#94A3B8] font-medium shrink-0">Columns:</span>
        <div className="flex items-center space-x-1.5 shrink-0">
          {currentTable.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center space-x-1 bg-[#171A21] px-2 py-0.5 rounded border border-[#232733]"
              title={
                col.foreignKey
                  ? `Foreign Key references ${col.foreignKey.table}.${col.foreignKey.column}`
                  : col.isPrimary
                  ? 'Primary Key'
                  : undefined
              }
            >
              {col.isPrimary && <KeyRound className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
              {col.foreignKey && <Link2 className="w-2.5 h-2.5 text-sky-400 shrink-0" />}
              <span className="font-mono text-slate-200">{col.name}</span>
              <span className="text-[10px] text-slate-500">{col.type}</span>
              {col.foreignKey && (
                <span className="text-[9px] text-sky-400/80 bg-sky-950/40 px-1 rounded">
                  → {col.foreignKey.table}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sample Data Table */}
      <div className="overflow-x-auto max-h-56">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#232733] bg-[#14171F]/80 text-[#94A3B8]">
              {currentTable.columns.map((col) => (
                <th
                  key={col.name}
                  className="px-3 py-2 font-mono font-medium tracking-wider text-[11px] whitespace-nowrap"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232733]/50 font-mono text-slate-300 text-[11px]">
            {currentTable.rows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#1D212B] transition-colors odd:bg-[#171A21] even:bg-[#151820]"
              >
                {currentTable.columns.map((col) => (
                  <td key={col.name} className="px-3 py-1.5 whitespace-nowrap">
                    {String(row[col.name] ?? 'NULL')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer status */}
      <div className="px-3 py-1.5 bg-[#12151D] border-t border-[#232733] text-[10px] text-[#94A3B8] flex items-center justify-between">
        <span>
          Showing {currentTable.rows.length} rows in <span className="font-mono text-slate-300">{currentTable.name}</span>
        </span>
        <span className="text-slate-500 italic">Live in-browser table</span>
      </div>
    </div>
  );
};
