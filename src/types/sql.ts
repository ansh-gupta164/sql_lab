export type SQLTopic = 'SQL Basics' | 'SELECT' | 'WHERE' | 'ORDER BY' | 'GROUP BY' | 'JOIN';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  name: string;
  description?: string;
  columns: ColumnDefinition[];
  rows: Record<string, string | number>[];
}

export interface DatabaseSchema {
  name: string;
  tables: TableSchema[];
}

export interface SQLResult {
  columns: string[];
  rows: Record<string, any>[];
}

export interface Question {
  id: number;
  title: string;
  description: string;
  topic: SQLTopic;
  difficulty: Difficulty;
  database: string;
  targetTable: string;
  starterQuery: string;
  hint: string;
  solution: string;
  expectedResult?: SQLResult;
  orderMatters?: boolean;
}

export interface ExecutionResult {
  status: 'idle' | 'success' | 'error';
  message: string;
  result?: SQLResult;
  executionTimeMs?: number;
  errorDetail?: string;
  isCorrect?: boolean;
  validationFeedback?: string;
}
