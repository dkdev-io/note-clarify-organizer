
/**
 * Utilities for extracting potential names from text
 */

/**
 * Extract potential names from text
 * This is a simple implementation that looks for words followed by "will"
 * A more sophisticated implementation would use NLP
 */
export function extractPotentialNames(text: string): string[] {
  // More comprehensive patterns to catch different ways people are assigned tasks
  const patterns = [
    /(\b[A-Z][a-z]*\b)\s+will\b/g,  // "John will"
    /(\b[A-Z][a-z]*\b)\s+needs to\b/g,  // "John needs to"
    /(\b[A-Z][a-z]*\b)\s+should\b/g,  // "John should"
    /(\b[A-Z][a-z]*\b)\s+is going to\b/g,  // "John is going to"
    /(\b[A-Z][a-z]*\b)\s+must\b/g,  // "John must"
    /(\b[A-Z][a-z]*\b)\s+to\b/g,  // "Assign John to"
  ];
  
  let allNames: string[] = [];
  
  patterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    const names = matches.map(match => match[1]);
    allNames = [...allNames, ...names];
  });
  
  // Remove duplicates
  return [...new Set(allNames)];
}
