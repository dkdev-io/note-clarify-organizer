
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
  
  // Improved nickname matching with more variations
  const commonNicknames: Record<string, string[]> = {
    'dan': ['daniel', 'danny', 'danielle'],
    'mat': ['matthew', 'matt', 'mateo', 'matteo'],
    'mtt': ['matthew', 'matt', 'mateo'],
    'dn': ['dan', 'daniel', 'danny', 'dean', 'deon'],
    'mt': ['matt', 'matthew', 'mateo'],
    'matt': ['matthew', 'matthias'],
    'dave': ['david', 'davey'],
    'jim': ['james', 'jimmy', 'jimbo'],
    'bob': ['robert', 'bobby', 'rob'],
    'bill': ['william', 'billy', 'will'],
    'mike': ['michael', 'micky', 'mick'],
    'tom': ['thomas', 'tommy'],
    'joe': ['joseph', 'joey'],
    'josh': ['joshua'],
    'ben': ['benjamin', 'benji'],
    'chris': ['christopher', 'christian', 'christoph'],
    'alex': ['alexander', 'alexandra', 'alexis', 'alejandro'],
    'nick': ['nicholas', 'nico', 'nicolas'],
    'rick': ['richard', 'ricky', 'ricardo'],
    'tony': ['anthony', 'antonio', 'antoine'],
    'sam': ['samuel', 'samantha', 'sammy'],
    'beth': ['elizabeth', 'elisabeth', 'betsy'],
    'juan': ['juanito', 'juanita'],
    'da': ['dan', 'daniel', 'dave', 'david'],
    'j': ['john', 'james', 'joseph', 'jack', 'jim', 'josh'],
    'm': ['michael', 'mark', 'mike', 'matthew', 'matt'],
    'd': ['david', 'daniel', 'dave', 'dan', 'derek'],
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

/**
 * Find potential matches for a name from a list of users
 * @param name The name to match
 * @param users Array of users to check against
 * @param threshold Similarity threshold (0-1)
 * @returns Array of potential matching users
 */
export function findUserMatches(name: string, users: any[], threshold: number = 0.6): any[] {
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

// Add an alias for findUserMatches to maintain backwards compatibility
export const findPotentialMatches = findUserMatches;
