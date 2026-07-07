import { shuffleArray } from './shuffle';

/**
 * Shuffles a question's options while keeping track of which shuffled
 * position now holds the correct answer.
 */
export function shuffleQuestionOptions(question) {
  const originalIndices = question.options.map((_, i) => i);
  const shuffledIndices = shuffleArray(originalIndices);
  const newOptions = shuffledIndices.map((i) => question.options[i]);
  const newCorrectIndex = shuffledIndices.indexOf(question.correctIndex);

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex,
  };
}