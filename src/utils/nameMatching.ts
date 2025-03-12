/**
 * Utility functions for matching names in text to Motion users
 */

/**
 * Checks if a name might be a shortened version of another name
 * e.g., "Dan" could be short for "Daniel", "Mat" for "Matthew", etc.
 */
export function isNicknameOrShortened(input: string, target: string): boolean {
  // Convert both to lowercase for case-insensitive comparison
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Direct check if input is completely contained in target
  if (targetLower.includes(inputLower)) {
    return true;
  }
  
  // Check for common nicknames and shortened versions
  const commonNicknames: Record<string, string[]> = {
    'dan': ['daniel', 'danny'],
    'mat': ['matthew', 'matt', 'mateo'],
    'dn': ['dan', 'daniel', 'danny', 'dean'],
    'dave': ['david'],
    'jim': ['james'],
    'bob': ['robert'],
    'bill': ['william'],
    'mike': ['michael'],
    'tom': ['thomas'],
    'joe': ['joseph'],
    'chris': ['christopher', 'christian'],
    'alex': ['alexander', 'alexandra'],
    'nick': ['nicholas'],
    'rick': ['richard'],
    'tony': ['anthony'],
    'sam': ['samuel', 'samantha'],
    'beth': ['elizabeth'],
    'juan': ['juanito', 'juanita'],
  };
  
  // Check if input is a known nickname
  if (commonNicknames[inputLower]) {
    return commonNicknames[inputLower].some(nick => targetLower.includes(nick));
  }
  
  // If target is a known nickname, check if input is in its variations
  for (const [nick, variations] of Object.entries(commonNicknames)) {
    if (targetLower.includes(nick) && variations.some(v => inputLower.includes(v))) {
      return true;
    }
  }
  
  // Check for first letter matching (e.g., "J" might refer to "Juan")
  if (inputLower.length === 1 && targetLower.startsWith(inputLower)) {
    return true;
  }
  
  // Check for significant substring match (more than 2 characters)
  if (inputLower.length > 2 && targetLower.includes(inputLower)) {
    return true;
  }
  
  return false;
}

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

/**
 * Find potential matches for a name from a list of users
 * @param name The name to match
 * @param users Array of users to check against
 * @param threshold Similarity threshold (0-1)
 * @returns Array of potential matching users
 */
export function findUserMatches(name: string, users: any[], threshold = 0.5): any[] {
  if (!name || !users || users.length === 0) {
    return [];
  }
  
  const nameLower = name.toLowerCase().trim();
  
  return users.filter(user => {
    // Skip users without names
    if (!user.name) return false;
    
    const userName = user.name.toLowerCase();
    
    // Check exact match
    if (userName === nameLower) return true;
    
    // Check if name is part of the username
    if (userName.includes(nameLower) || nameLower.includes(userName)) return true;
    
    // Check for nickname matches
    if (isNicknameOrShortened(nameLower, userName)) return true;
    
    // Calculate similarity score
    const similarity = calculateSimilarity(nameLower, userName);
    return similarity >= threshold;
  });
}

/**
 * Extract potential names from text
 * This is a simple implementation that looks for words followed by "will"
 * A more sophisticated implementation would use NLP
 */
export function extractPotentialNames(text: string): string[] {
  const namePattern = /(\b[A-Z][a-z]*\b)\s+will\b/g;
  const matches = [...text.matchAll(namePattern)];
  return matches.map(match => match[1]);
}

// Add an alias for findUserMatches to maintain backwards compatibility
export const findPotentialMatches = findUserMatches;
