/**
 * Nigerian-style name convention assumed: "Surname FirstName" e.g. "Chukwu John"
 * Greeting uses the SECOND word (first name).
 * Avatar initials use the first letter of the first TWO words, in the order typed.
 */

export function parseFullName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const surname = parts[0] || '';
  const firstName = parts[1] || parts[0] || '';
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  return { surname, firstName, initials, fullName: fullName.trim() };
}

export function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'good morning';
  if (hour < 17) return 'good afternoon';
  return 'good evening';
}