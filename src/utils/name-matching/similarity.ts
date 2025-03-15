
/**
 * Utilities for calculating string similarity between names
 */

/**
 * Calculates string similarity score (0-1) between two strings
 * Higher score = more similar
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance implementation
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  // Fast path for equal strings or empty strings
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  // Check first name match (common in professional settings)
  const aFirstName = a.split(' ')[0];
  const bFirstName = b.split(' ')[0];
  if (aFirstName === bFirstName) return 0.9; // High score for matching first names
  
  // Create matrix
  const matrix = [];
  
  // Initialize first row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  // Initialize first column
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  // Calculate similarity score (1 - normalized distance)
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - matrix[b.length][a.length] / maxLength;
}
