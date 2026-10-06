import type { Question } from '../types/sql';

/**
 * 10 beginner SQL questions verified against the live college_db.
 *
 * Row counts verified by running each solution against alasql with
 * the actual dataset (18 students, 5 departments, 10 courses, 32 enrollments).
 *
 * starterQuery — the partial query shown to guide the student
 * solution     — the verified correct answer used to compute expected results
 * orderMatters — true when the question explicitly requires a specific sort order
 */
export const questions: Question[] = [
  // ────────────────────────────────────────────────
  // Q1 · SQL Basics · SELECT *
  // Solution returns: 18 rows, 5 columns
  // ────────────────────────────────────────────────
  {
    id: 1,
    title: 'Select all students',
    description:
      'Write a SQL query to retrieve every column and every row from the students table. This is the simplest SQL query and is the starting point for all data retrieval.',
    topic: 'SQL Basics',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Select all columns from the students table\nSELECT * FROM students;`,
    hint: 'The asterisk (*) means "all columns". Combine it with FROM students to retrieve every row.',
    solution: 'SELECT * FROM students;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q2 · WHERE · Numeric comparison
  // Solution returns: 10 rows — students with marks > 80
  // ────────────────────────────────────────────────
  {
    id: 2,
    title: 'Find students with marks greater than 80',
    description:
      'Write a SQL query to find all students whose marks are strictly greater than 80. Return their id, name, and marks.',
    topic: 'WHERE',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Add a WHERE clause to filter by marks\nSELECT id, name, marks\nFROM students\nWHERE `,
    hint: 'Use the WHERE clause followed by a condition: marks > 80. The > operator means "greater than".',
    solution: 'SELECT id, name, marks FROM students WHERE marks > 80;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q3 · WHERE · Filtering by a numeric foreign-key value
  // Solution returns: 6 rows — students in CS department (department_id = 1)
  // ────────────────────────────────────────────────
  {
    id: 3,
    title: 'Find students in the Computer Science department',
    description:
      'Write a SQL query to find all students enrolled in the Computer Science department (department_id = 1). Return their id, name, and marks.',
    topic: 'WHERE',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Filter students by their department_id\nSELECT id, name, marks\nFROM students\nWHERE `,
    hint: 'Use WHERE department_id = 1 to select only Computer Science students. department_id is a number, so no quotes needed.',
    solution: 'SELECT id, name, marks FROM students WHERE department_id = 1;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q4 · ORDER BY · Descending sort
  // Solution returns: 18 rows sorted by marks DESC
  // orderMatters = true because a specific order is required
  // ────────────────────────────────────────────────
  {
    id: 4,
    title: 'Sort students by marks (highest first)',
    description:
      'Write a SQL query to list all students sorted by their marks in descending order, so the highest scorer appears first. Return their id, name, and marks.',
    topic: 'ORDER BY',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Add ORDER BY to sort the results\nSELECT id, name, marks\nFROM students\nORDER BY `,
    hint: 'ORDER BY comes after FROM. Use ORDER BY marks DESC — DESC means "descending" (highest first). ASC would be ascending (lowest first).',
    solution: 'SELECT id, name, marks FROM students ORDER BY marks DESC;',
    orderMatters: true,
  },

  // ────────────────────────────────────────────────
  // Q5 · WHERE · Age comparison + LIMIT
  // Solution returns: 8 rows — students with age < 21
  // ────────────────────────────────────────────────
  {
    id: 5,
    title: 'Find students younger than 21',
    description:
      'Write a SQL query to find all students whose age is strictly less than 21. Return their id, name, age, and marks.',
    topic: 'WHERE',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Use < operator to filter by age\nSELECT id, name, age, marks\nFROM students\nWHERE `,
    hint: 'Use WHERE age < 21. The < operator means "less than". Students aged exactly 21 should NOT be included.',
    solution: 'SELECT id, name, age, marks FROM students WHERE age < 21;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q6 · SELECT / Aggregate · COUNT(*)
  // Solution returns: 1 row — {total_students: 18}
  // ────────────────────────────────────────────────
  {
    id: 6,
    title: 'Count the total number of students',
    description:
      'Write a SQL query to count the total number of students enrolled in the college. Use an alias so the result column is named total_students.',
    topic: 'SELECT',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Use the COUNT aggregate function\nSELECT COUNT(*) AS total_students\nFROM students;`,
    hint: 'COUNT(*) counts every row in the table. Use AS total_students to give the result column a readable name.',
    solution: 'SELECT COUNT(*) AS total_students FROM students;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q7 · ORDER BY + LIMIT · MAX via sort
  // Solution returns: 1 row — top student by marks
  // orderMatters = true (LIMIT 1 of a DESC sort)
  // ────────────────────────────────────────────────
  {
    id: 7,
    title: 'Find the student with the highest marks',
    description:
      'Write a SQL query to retrieve only the single student who scored the highest marks. Return their id, name, and marks.',
    topic: 'ORDER BY',
    difficulty: 'Medium',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Sort descending by marks then take only the first row\nSELECT id, name, marks\nFROM students\nORDER BY marks DESC\n`,
    hint: 'Sort all students by marks descending (ORDER BY marks DESC) so the highest mark is first, then use LIMIT 1 to keep only that one row.',
    solution: 'SELECT id, name, marks FROM students ORDER BY marks DESC LIMIT 1;',
    orderMatters: true,
  },

  // ────────────────────────────────────────────────
  // Q8 · SELECT / Aggregate · AVG()
  // Solution returns: 1 row — {average_marks: 80.72}
  // ────────────────────────────────────────────────
  {
    id: 8,
    title: 'Calculate the average marks',
    description:
      'Write a SQL query to calculate the average marks scored across all students. Name the result column average_marks.',
    topic: 'SELECT',
    difficulty: 'Easy',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- Use the AVG aggregate function\nSELECT AVG(marks) AS average_marks\nFROM students;`,
    hint: 'AVG(column_name) calculates the arithmetic mean of all non-NULL values in that column. Use AS average_marks to label the result.',
    solution: 'SELECT AVG(marks) AS average_marks FROM students;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q9 · GROUP BY · COUNT per department
  // Solution returns: 5 rows — one per department
  // ────────────────────────────────────────────────
  {
    id: 9,
    title: 'Count students in each department',
    description:
      'Write a SQL query to count how many students are in each department. Return department_id and the count as student_count. Each department should appear as one row.',
    topic: 'GROUP BY',
    difficulty: 'Medium',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- GROUP BY groups rows sharing the same value\nSELECT department_id, COUNT(*) AS student_count\nFROM students\nGROUP BY `,
    hint: 'GROUP BY department_id tells SQL to group all rows with the same department_id together. COUNT(*) then counts rows within each group.',
    solution: 'SELECT department_id, COUNT(*) AS student_count FROM students GROUP BY department_id;',
    orderMatters: false,
  },

  // ────────────────────────────────────────────────
  // Q10 · JOIN · INNER JOIN students ↔ departments
  // Solution returns: 18 rows — name, marks, dept_name
  // ────────────────────────────────────────────────
  {
    id: 10,
    title: 'Join students with their departments',
    description:
      'Write a SQL query to join the students table with the departments table to show each student\'s name, marks, and department name (dept_name). Every student should appear because every student has a department.',
    topic: 'JOIN',
    difficulty: 'Medium',
    database: 'college_db',
    targetTable: 'students',
    starterQuery: `-- INNER JOIN links two tables on a matching column\nSELECT students.name, students.marks, departments.dept_name\nFROM students\nINNER JOIN departments ON `,
    hint: 'An INNER JOIN needs an ON condition that connects the two tables. Connect them where students.department_id = departments.id.',
    solution: 'SELECT students.name, students.marks, departments.dept_name FROM students INNER JOIN departments ON students.department_id = departments.id;',
    orderMatters: false,
  },
];
