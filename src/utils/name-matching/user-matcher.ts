
/**
 * Utilities for matching names to users
 */

import { NameMatchUser } from './types';
import { isNicknameOrShortened } from './nickname-matcher';
import { calculateSimilarity } from './similarity';

/**
 * Find potential matches for a name from a list of users
 * @param name The name to match
 * @param users Array of users to check against
 * @param threshold Similarity threshold (0-1)
 * @returns Array of potential matching users
 */
export function findUserMatches(name: string, users: NameMatchUser[], threshold: number = 0.6): NameMatchUser[] {
  if (!name || !users || users.length === 0) {
    console.log(`No matches possible for ${name} - empty input or no users available`);
    return [];
  }
  
  // Normalize the name for comparison (lowercase)
  const normalizedName = name.toLowerCase();
  console.log(`Finding matches for: "${name}" (normalized: "${normalizedName}")`);
  console.log(`Available users: ${users.map(u => u.name).join(', ')}`);
  
  // First check for exact matches (case-insensitive)
  const exactMatches = users.filter(user => {
    if (!user.name) return false;
    const userName = user.name.toLowerCase();
    const firstNameOnly = userName.split(' ')[0]; // Get just the first name
    
    const exactFullMatch = userName === normalizedName;
    const exactFirstNameMatch = firstNameOnly === normalizedName;
    const nameIncludes = userName.includes(normalizedName);
    const firstNameIncludes = normalizedName.includes(firstNameOnly);
    
    if (exactFullMatch || exactFirstNameMatch || nameIncludes || firstNameIncludes) {
      console.log(`Exact match found: "${name}" matches "${user.name}"`);
      return true;
    }
    return false;
  });
  
  if (exactMatches.length > 0) {
    console.log(`Found ${exactMatches.length} exact matches for ${name}`);
    return exactMatches;
  }
  
  // Check for nickname matches
  const nicknameMatches = users.filter(user => {
    if (!user.name) return false;
    const userName = user.name.toLowerCase();
    const firstNameOnly = userName.split(' ')[0];
    
    if (isNicknameOrShortened(normalizedName, firstNameOnly) || 
        isNicknameOrShortened(firstNameOnly, normalizedName)) {
      console.log(`Nickname match found: "${name}" matches "${user.name}" through nickname recognition`);
      return true;
    }
    return false;
  });
  
  if (nicknameMatches.length > 0) {
    console.log(`Found ${nicknameMatches.length} nickname matches for ${name}`);
    return nicknameMatches;
  }
  
  // If no exact or nickname matches, try similarity-based matching
  console.log(`No exact or nickname matches for ${name}, trying similarity matching`);
  const similarityMatches = users
    .map(user => ({
      user,
      similarity: calculateSimilarity(normalizedName, user.name?.toLowerCase() || '')
    }))
    .filter(match => match.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .map(match => {
      console.log(`Similarity match: "${name}" ~ "${match.user.name}" (score: ${match.similarity.toFixed(2)})`);
      return match.user;
    });
  
  console.log(`Found ${similarityMatches.length} similarity matches for ${name}`);
  return similarityMatches;
}

// Add an alias for findUserMatches to maintain backwards compatibility
export const findPotentialMatches = findUserMatches;
