/**
 * Expected CSV columns (with header row):
 * subjectCode,question,option1,option2,option3,option4,correctIndex,explanation,difficulty
 *
 * correctIndex is 0-based (0 = option1, 1 = option2, etc.)
 * difficulty is optional: easy | medium | hard (defaults to medium)
 */

export function parseQuestionsCSV(csvText, subjectsByCode) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.');
  }

  const rows = lines.slice(1);
  const parsed = [];
  const errors = [];

  rows.forEach((row, i) => {
    const cols = splitCSVLine(row);
    if (cols.length < 7) {
      errors.push(`Row ${i + 2}: not enough columns.`);
      return;
    }

    const [subjectCode, question, opt1, opt2, opt3, opt4, correctIndexRaw, explanation, difficulty] = cols;
    const subject = subjectsByCode[subjectCode.trim().toUpperCase()];

    if (!subject) {
      errors.push(`Row ${i + 2}: unknown subject code "${subjectCode}".`);
      return;
    }

    const correctIndex = parseInt(correctIndexRaw, 10);
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      errors.push(`Row ${i + 2}: correctIndex must be 0-3.`);
      return;
    }

    parsed.push({
      subjectId: subject.id,
      text: question,
      options: [opt1, opt2, opt3, opt4],
      correctIndex,
      explanation: explanation || '',
      difficulty: (difficulty || 'medium').toLowerCase(),
    });
  });

  return { parsed, errors };
}

function splitCSVLine(line) {
  // Handles simple comma splitting with quoted fields containing commas
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((c) => c.trim().replace(/^"|"$/g, ''));
}