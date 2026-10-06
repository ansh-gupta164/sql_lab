import alasql from 'alasql';
import { collegeDatabase } from '../data/database';
import type { SQLResult, ExecutionResult, Question } from '../types/sql';

let isDatabaseInitialized = false;

// Map of table name → column names for better error messages
const TABLE_COLUMNS: Record<string, string[]> = {
  students: ['id', 'name', 'age', 'department_id', 'marks'],
  departments: ['id', 'dept_name', 'dept_head', 'building'],
  courses: ['id', 'course_name', 'department_id', 'credits'],
  enrollments: ['id', 'student_id', 'course_id', 'semester', 'grade'],
};

const KNOWN_TABLES = Object.keys(TABLE_COLUMNS);

/**
 * Initializes the in-browser SQL database with college_db schema and seed data.
 * Runs once per session; call with forceReload=true if data needs resetting.
 */
export function initDatabase(forceReload = false): void {
  if (isDatabaseInitialized && !forceReload) return;

  try {
    // Drop existing tables in dependency order to avoid FK constraint issues
    const dropOrder = ['enrollments', 'courses', 'students', 'departments'];
    dropOrder.forEach((name) => alasql(`DROP TABLE IF EXISTS ${name};`));

    // Create and seed each table
    collegeDatabase.tables.forEach((table) => {
      const colDefs = table.columns
        .map((col) => {
          const colType = col.type.startsWith('INT') ? 'INT' : 'STRING';
          return `${col.name} ${colType}`;
        })
        .join(', ');

      alasql(`CREATE TABLE ${table.name} (${colDefs});`);

      if (table.rows.length > 0) {
        // Deep-clone to prevent alasql from mutating our source data
        alasql.tables[table.name].data = JSON.parse(JSON.stringify(table.rows));
      }
    });

    isDatabaseInitialized = true;
  } catch (err: unknown) {
    isDatabaseInitialized = false;
    console.error('[SQLEngine] Failed to initialize database:', err);
    throw err;
  }
}

/**
 * Strips SQL line comments (--) and trims the query.
 */
export function cleanQuery(query: string): string {
  return query
    .replace(/--[^\n]*/g, '') // Remove line comments
    .trim();
}

/**
 * Determines whether a cleaned query string is effectively empty
 * (empty, whitespace-only, or only semicolons).
 */
function isEffectivelyEmpty(cleaned: string): boolean {
  return /^[;\s]*$/.test(cleaned);
}

/**
 * Extracts the table name from a query for context in error messages.
 */
function extractTableName(query: string): string | null {
  const match = query.toUpperCase().match(/FROM\s+([A-Z_][A-Z0-9_]*)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Converts raw alasql error messages into beginner-friendly messages with
 * concrete guidance (available columns, available tables, etc.).
 */
function formatStudentError(
  rawMessage: string,
  originalQuery: string
): { message: string; detail: string } {
  const lower = rawMessage.toLowerCase();

  // ── COLUMN NOT FOUND ────────────────────────────────────────────────────────
  // alasql: "Column does not exist: xyz"
  if (lower.includes('column does not exist') || lower.includes('column not found')) {
    const colMatch = rawMessage.match(/Column does not exist:\s*([^\s]+)/i);
    const columnName = colMatch ? colMatch[1] : 'one or more columns';

    // Try to find which table was referenced to give better column hints
    const tableName = extractTableName(originalQuery);
    const availableCols = tableName && TABLE_COLUMNS[tableName]
      ? `Available columns in ${tableName}: ${TABLE_COLUMNS[tableName].join(', ')}.`
      : 'Check the Database Explorer on the left for correct column names.';

    return {
      message: `Unknown column: "${columnName}"`,
      detail: `The column "${columnName}" does not exist in the table. ${availableCols}`,
    };
  }

  // ── TABLE NOT FOUND ──────────────────────────────────────────────────────────
  // alasql: "Table does not exist: xyz"
  if (lower.includes('table does not exist') || lower.includes('table not found') || lower.includes('cannot find table')) {
    const tableMatch = rawMessage.match(/Table does not exist:\s*([^\s]+)/i);
    const tableName = tableMatch ? tableMatch[1] : 'unknown';

    return {
      message: `Table "${tableName}" not found`,
      detail: `The table "${tableName}" does not exist in college_db. Available tables: ${KNOWN_TABLES.join(', ')}.`,
    };
  }

  // ── SYNTAX / PARSE ERROR ─────────────────────────────────────────────────────
  // alasql: "Parse error on line N: ..."
  if (lower.includes('parse error') || lower.includes('syntax') || lower.includes('unexpected token')) {
    // Extract just the problematic token if visible
    const tokenMatch = rawMessage.match(/Expecting\s+'([^']+)'/);
    const hint = tokenMatch ? ` (unexpected "${tokenMatch[1]}").` : '.';

    return {
      message: 'SQL Syntax Error',
      detail: `Your query has a syntax error${hint} Check your clause order: SELECT → FROM → WHERE → GROUP BY → ORDER BY → LIMIT. Also ensure all strings are wrapped in single quotes.`,
    };
  }

  // ── AGGREGATION / GROUP BY ERROR ─────────────────────────────────────────────
  if (lower.includes('group by') || lower.includes('aggregate') || lower.includes('not in group')) {
    return {
      message: 'Aggregation Error',
      detail: 'When using aggregate functions (COUNT, AVG, SUM, MAX, MIN) alongside regular columns, add all non-aggregated columns to GROUP BY.',
    };
  }

  // ── AMBIGUOUS COLUMN ─────────────────────────────────────────────────────────
  if (lower.includes('ambiguous')) {
    return {
      message: 'Ambiguous Column Reference',
      detail: 'A column name is shared by multiple tables in this query. Prefix it with the table name, e.g. students.id instead of just id.',
    };
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────────
  return {
    message: 'Query Execution Error',
    detail: rawMessage.replace(/^Error:\s*/i, '').slice(0, 200),
  };
}

/**
 * Executes a raw SQL string against the in-browser database.
 * Returns either a result set or a structured error object.
 */
export function executeRawSQL(sqlString: string): {
  result?: SQLResult;
  error?: { message: string; detail: string };
  executionTimeMs: number;
} {
  initDatabase();

  const cleaned = cleanQuery(sqlString);

  if (isEffectivelyEmpty(cleaned)) {
    return {
      error: {
        message: 'Empty Query',
        detail: 'Please write a SQL query in the editor before clicking Run Query.',
      },
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();
  try {
    const rawRes = alasql(cleaned);
    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    let rows: Record<string, unknown>[] = [];
    let columns: string[] = [];

    if (Array.isArray(rawRes)) {
      rows = rawRes as Record<string, unknown>[];
      if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
        columns = Object.keys(rows[0]);
      }
    } else if (typeof rawRes === 'object' && rawRes !== null) {
      rows = [rawRes as Record<string, unknown>];
      columns = Object.keys(rawRes as object);
    } else if (rawRes !== undefined && rawRes !== null) {
      rows = [{ result: rawRes }];
      columns = ['result'];
    }

    return { result: { columns, rows }, executionTimeMs };
  } catch (err: unknown) {
    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));
    const rawMsg = err instanceof Error ? err.message : String(err);
    return {
      error: formatStudentError(rawMsg, cleaned),
      executionTimeMs,
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Result Comparison
// ────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a single cell value for comparison.
 * - Numbers are rounded to 2 decimal places (handles AVG float drift)
 * - Strings are trimmed and lowercased
 * - null/undefined become the literal string "null"
 */
function normalizeVal(val: unknown): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') {
    // Round to 2dp to handle floating-point drift (e.g. AVG returns 80.722...)
    return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(2)).toString();
  }
  return String(val).trim().toLowerCase();
}

/**
 * Serializes a row into a canonical string for multiset comparison.
 * Looks up column keys case-insensitively.
 */
function serializeRow(row: Record<string, unknown>, colNames: string[]): string {
  return colNames
    .map((col) => {
      const key = Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase()) ?? col;
      return normalizeVal(row[key]);
    })
    .join('\x00'); // Use null byte as separator (can't appear in normal SQL output)
}

/**
 * Compares an actual query result against an expected result.
 * Returns whether the answer is correct and a human-readable explanation.
 */
export function compareResults(
  actual: SQLResult,
  expected: SQLResult,
  orderMatters = false
): { isCorrect: boolean; feedback: string } {
  // ── Row count check ──────────────────────────────────────────────────────────
  if (actual.rows.length !== expected.rows.length) {
    if (actual.rows.length === 0) {
      return {
        isCorrect: false,
        feedback: `Your query returned 0 rows, but ${expected.rows.length} ${expected.rows.length === 1 ? 'row is' : 'rows are'} expected. Check your WHERE conditions or JOIN clause.`,
      };
    }
    return {
      isCorrect: false,
      feedback: `Your query returned ${actual.rows.length} ${actual.rows.length === 1 ? 'row' : 'rows'}, but ${expected.rows.length} ${expected.rows.length === 1 ? 'row is' : 'rows are'} expected. Check your filter conditions.`,
    };
  }

  // ── Column count check ───────────────────────────────────────────────────────
  if (actual.columns.length !== expected.columns.length) {
    return {
      isCorrect: false,
      feedback: `Your query returned ${actual.columns.length} column(s) (${actual.columns.join(', ')}), but this question requires ${expected.columns.length} column(s) (${expected.columns.join(', ')}).`,
    };
  }

  // ── Row content check ────────────────────────────────────────────────────────
  if (orderMatters) {
    for (let i = 0; i < expected.rows.length; i++) {
      const actualStr = serializeRow(actual.rows[i], actual.columns);
      const expectedStr = serializeRow(expected.rows[i], expected.columns);
      if (actualStr !== expectedStr) {
        return {
          isCorrect: false,
          feedback: `Row ${i + 1} does not match. The rows may not be in the correct order — check your ORDER BY clause and sort direction (ASC vs DESC).`,
        };
      }
    }
  } else {
    // Order-independent: compare sorted serialisations
    const actualSorted = actual.rows.map((r) => serializeRow(r, actual.columns)).sort();
    const expectedSorted = expected.rows.map((r) => serializeRow(r, expected.columns)).sort();

    for (let i = 0; i < expectedSorted.length; i++) {
      if (actualSorted[i] !== expectedSorted[i]) {
        return {
          isCorrect: false,
          feedback: 'The query ran and returned the right number of rows, but the returned values do not match the expected result. Check your WHERE conditions, column expressions, or JOIN condition.',
        };
      }
    }
  }

  return { isCorrect: true, feedback: '✓ Correct answer! Your query matches the expected result.' };
}

/**
 * Generates (and caches per-session) the expected result for a question
 * by running its verified model solution against the live database.
 */
const expectedResultCache = new Map<number, SQLResult>();

export function getExpectedResult(question: Question): SQLResult {
  if (expectedResultCache.has(question.id)) {
    return expectedResultCache.get(question.id)!;
  }

  const { result, error } = executeRawSQL(question.solution);
  if (error || !result) {
    console.error(`[SQLEngine] Could not run solution for Q${question.id}:`, error);
    return { columns: [], rows: [] };
  }

  expectedResultCache.set(question.id, result);
  return result;
}

/**
 * Runs the user's query and validates it against the question's expected result.
 * This is the main entry point called from the UI.
 */
export function runAndValidateQuery(userQuery: string, question: Question): ExecutionResult {
  const { result, error, executionTimeMs } = executeRawSQL(userQuery);

  if (error) {
    return {
      status: 'error',
      message: error.message,
      errorDetail: error.detail,
      executionTimeMs,
      isCorrect: false,
    };
  }

  if (!result) {
    return {
      status: 'error',
      message: 'No result returned',
      errorDetail: 'The query produced no output. Make sure you are using a SELECT statement.',
      executionTimeMs,
      isCorrect: false,
    };
  }

  const expected = getExpectedResult(question);
  const { isCorrect, feedback } = compareResults(result, expected, question.orderMatters);

  return {
    status: 'success',
    message: isCorrect ? '✓ Query executed — Correct answer!' : '✓ Query executed',
    result,
    executionTimeMs,
    isCorrect,
    validationFeedback: feedback,
  };
}
