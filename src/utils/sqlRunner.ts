import type { Question, ExecutionResult } from '../types/sql';

/**
 * Strips comments and normalizes whitespace in SQL strings
 */
export function cleanQuery(query: string): string {
  return query
    // Remove single line comments
    .replace(/--.*$/gm, '')
    // Replace multiple whitespaces/newlines with single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates a user query against the selected question and returns realistic feedback
 */
export function executeQuery(userQuery: string, currentQuestion: Question): ExecutionResult {
  const cleaned = cleanQuery(userQuery);

  if (!cleaned) {
    return {
      status: 'error',
      message: 'Please write a SQL query to execute.',
      errorDetail: 'The editor is empty. Enter your SQL statement and click "Run Query".',
    };
  }

  const normalized = cleaned.toUpperCase().replace(/;+$/, '');

  // Basic SQL syntax validation
  if (!normalized.startsWith('SELECT')) {
    return {
      status: 'error',
      message: "Syntax Error: Queries must begin with the 'SELECT' keyword.",
      errorDetail: 'In SQL, data retrieval begins with SELECT followed by the column names or *.',
    };
  }

  if (!normalized.includes('FROM')) {
    return {
      status: 'error',
      message: "Syntax Error: Missing 'FROM' clause.",
      errorDetail: 'Specify which table to retrieve data from, e.g. FROM students.',
    };
  }

  // Question-specific validation with helpful, beginner-friendly feedback
  switch (currentQuestion.id) {
    case 1: { // Select all students
      if (
        normalized.includes('FROM STUDENTS') &&
        (normalized.includes('SELECT *') || 
         (normalized.includes('ID') && normalized.includes('NAME') && normalized.includes('MARKS') && normalized.includes('COURSE')))
      ) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Your query doesn't match the expected result.",
        errorDetail: 'Make sure to select all columns using SELECT * FROM students;',
      };
    }

    case 2: { // Marks > 80
      if (!normalized.includes('WHERE')) {
        return {
          status: 'error',
          message: "Missing 'WHERE' filter clause.",
          errorDetail: 'Your query ran, but returned all students. Add WHERE marks > 80 to filter rows.',
        };
      }
      if (
        (normalized.includes('MARKS > 80') || normalized.includes('80 < MARKS') || normalized.includes('MARKS>80')) &&
        normalized.includes('STUDENTS')
      ) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Your query doesn't match the expected result. Check the WHERE condition.",
        errorDetail: 'Verify that you are checking if marks are strictly greater than 80.',
      };
    }

    case 3: { // Students from CSE
      if (!normalized.includes('WHERE')) {
        return {
          status: 'error',
          message: "Missing 'WHERE' filter clause.",
          errorDetail: "Add a condition to filter by course: WHERE course = 'CSE'",
        };
      }
      const hasCseCondition = 
        cleaned.toLowerCase().includes("course = 'cse'") ||
        cleaned.toLowerCase().includes('course = "cse"') ||
        cleaned.toLowerCase().includes("course='cse'") ||
        cleaned.toLowerCase().includes('course="cse"');

      if (hasCseCondition && normalized.includes('STUDENTS')) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Your query doesn't match the expected result.",
        errorDetail: "Filter by CSE using WHERE course = 'CSE'. In SQL, string literals are enclosed in quotes.",
      };
    }

    case 4: { // Sort students by marks
      if (!normalized.includes('ORDER BY')) {
        return {
          status: 'error',
          message: "Missing 'ORDER BY' sorting clause.",
          errorDetail: 'Use ORDER BY marks DESC to sort students from highest to lowest marks.',
        };
      }
      if (!normalized.includes('DESC')) {
        return {
          status: 'error',
          message: "Incorrect sort direction.",
          errorDetail: 'By default, SQL sorts ascending (lowest first). Add DESC to sort descending (highest first).',
        };
      }
      if (normalized.includes('ORDER BY MARKS DESC')) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Check your ORDER BY clause.",
        errorDetail: 'Ensure you are ordering by marks DESC.',
      };
    }

    case 5: { // Age < 21
      if (!normalized.includes('WHERE')) {
        return {
          status: 'error',
          message: "Missing 'WHERE' filter clause.",
          errorDetail: 'Filter students who are under 21 using WHERE age < 21.',
        };
      }
      if (
        (normalized.includes('AGE < 21') || normalized.includes('21 > AGE') || normalized.includes('AGE<21')) &&
        normalized.includes('STUDENTS')
      ) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Check your condition in the WHERE clause.",
        errorDetail: 'Ensure your filter condition is age < 21.',
      };
    }

    case 6: { // Count students
      if (normalized.includes('COUNT(') || normalized.includes('COUNT (*)')) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Missing COUNT aggregate function.",
        errorDetail: 'Use the aggregate function COUNT(*) to count the rows in the students table.',
      };
    }

    case 7: { // Highest marks
      if (!normalized.includes('ORDER BY') || !normalized.includes('DESC')) {
        return {
          status: 'error',
          message: "Missing descending sort.",
          errorDetail: 'Sort students with ORDER BY marks DESC to place the highest score at the top.',
        };
      }
      if (!normalized.includes('LIMIT 1')) {
        return {
          status: 'error',
          message: "Returned too many rows.",
          errorDetail: 'You sorted the records, but need only the top 1 student. Add LIMIT 1 at the end of your query.',
        };
      }
      return createSuccessResult(currentQuestion);
    }

    case 8: { // Average marks
      if (normalized.includes('AVG(') || normalized.includes('AVG (')) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Missing AVG aggregate function.",
        errorDetail: 'Use AVG(marks) to calculate the mean score across all students.',
      };
    }

    case 9: { // Group by course
      if (!normalized.includes('GROUP BY')) {
        return {
          status: 'error',
          message: "Missing 'GROUP BY' clause.",
          errorDetail: 'Use GROUP BY course to aggregate the student count for each distinct course.',
        };
      }
      if (!normalized.includes('COUNT')) {
        return {
          status: 'error',
          message: "Missing COUNT function.",
          errorDetail: 'Select both course and COUNT(*) to count students per course.',
        };
      }
      if (normalized.includes('GROUP BY COURSE')) {
        return createSuccessResult(currentQuestion);
      }
      return {
        status: 'error',
        message: "Incorrect grouping.",
        errorDetail: 'Group by the course column using GROUP BY course.',
      };
    }

    case 10: { // JOIN students and departments
      if (!normalized.includes('JOIN')) {
        return {
          status: 'error',
          message: "Missing 'JOIN' clause.",
          errorDetail: 'Combine the tables using JOIN departments ON students.course = departments.dept_name.',
        };
      }
      if (!normalized.includes('DEPARTMENTS')) {
        return {
          status: 'error',
          message: "Target table departments not specified.",
          errorDetail: 'Make sure you are joining the students table with the departments table.',
        };
      }
      if (!normalized.includes('ON')) {
        return {
          status: 'error',
          message: "Missing 'ON' condition for JOIN.",
          errorDetail: 'Specify how the tables connect: ON students.course = departments.dept_name',
        };
      }
      return createSuccessResult(currentQuestion);
    }

    default:
      return createSuccessResult(currentQuestion);
  }
}

function createSuccessResult(question: Question): ExecutionResult {
  const simulatedTime = Math.floor(Math.random() * 8) + 8; // 8-15ms realistic latency
  return {
    status: 'success',
    message: '✓ Query executed successfully',
    result: question.expectedResult,
    executionTimeMs: simulatedTime,
  };
}
