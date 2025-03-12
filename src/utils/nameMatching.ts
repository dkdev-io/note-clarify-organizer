
/**
 * Utility functions for matching and suggesting user names
 */

interface User {
  id: string;
  name: string;
  email?: string;
}

/**
 * Calculate similarity score between two strings
 * using Levenshtein distance and other factors
 */
export const calculateSimilarity = (name1: string, name2: string): number => {
  if (!name1 || !name2) return 0;
  
  // Normalize strings for comparison
  const s1 = name1.toLowerCase().trim();
  const s2 = name2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1;
  
  // Check if one is contained in the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }
  
  // Check if one name is a part of another (e.g., first name only)
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip short words
    for (const word2 of words2) {
      if (word2.length < 3) continue; // Skip short words
      if (word1 === word2) return 0.7;
    }
  }
  
  // Calculate Levenshtein distance for more complex matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const track = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    
    return track[str2.length][str1.length];
  };
  
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 0;
  
  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
};

/**
 * Find potential user matches based on name
 * @param inputName The name to match
 * @param users List of users to match against
 * @param threshold Similarity threshold (0-1), defaults to 0.6
 * @returns Array of potential matches sorted by relevance
 */
export const findPotentialMatches = (
  inputName: string, 
  users: User[], 
  threshold = 0.6
): User[] => {
  if (!inputName || !users || users.length === 0) {
    return [];
  }
  
  // Calculate similarity scores for each user
  const scoredUsers = users.map(user => ({
    user,
    score: calculateSimilarity(inputName, user.name)
  }));
  
  // Filter by threshold and sort by score (highest first)
  return scoredUsers
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(item => item.user);
};

/**
 * Check if a name has a potential match in the users list
 */
export const hasNameMatch = (
  name: string,
  users: User[],
  threshold = 0.8
): boolean => {
  return findPotentialMatches(name, users, threshold).length > 0;
};
