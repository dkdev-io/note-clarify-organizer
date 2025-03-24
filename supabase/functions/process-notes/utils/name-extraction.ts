
import { corsHeaders } from "./cors.ts";

// Extract potential names from text
export function extractNamesFromText(text: string): string[] {
  // Look for patterns like "Name will..." which typically indicate a task assignment
  const namePatterns = [
    /(\b[A-Z][a-z]+\b)\s+will\b/g,           // "Name will..."
    /(\b[A-Z][a-z]+\b)\s+(?:should|needs to|has to|must)\b/g,  // "Name should/needs to/has to/must..."
    /\bassign(?:ed)?\s+to\s+(\b[A-Z][a-z]+\b)/gi,  // "assigned to Name"
    /(\b[A-Z][a-z]+\b)'s\s+(?:task|responsibility|job)/g,  // "Name's task/responsibility/job"
    /(\b[A-Z][a-z]+\b)\s+is\s+(?:responsible|assigned)/g,  // "Name is responsible/assigned"
  ];
  
  let allNames = [];
  
  // Apply each pattern and collect names
  for (const pattern of namePatterns) {
    const matches = [...text.matchAll(pattern)];
    const names = matches.map(match => match[1]);
    allNames = [...allNames, ...names];
  }
  
  // Return unique names
  return [...new Set(allNames)];
}

// Try to find best matches for names in the text against Motion users
export function findNameMatches(extractedNames: string[], motionUsers: any[]): Record<string, any> {
  if (!motionUsers || !Array.isArray(motionUsers) || motionUsers.length === 0) {
    return {}; // Can't match without user list
  }
  
  console.log('Trying to match names against Motion users:', extractedNames);
  
  const userNames = motionUsers.map(user => {
    // Get both full name and first name
    const fullName = user.name || '';
    const firstName = fullName.split(' ')[0].toLowerCase();
    return { 
      user,
      fullName: fullName.toLowerCase(), 
      firstName,
      id: user.id
    };
  }).filter(name => name.firstName); // Remove empty names
  
  const matches: Record<string, any> = {};
  
  extractedNames.forEach(name => {
    const nameLower = name.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    
    for (const userData of userNames) {
      let score = 0;
      
      // Exact first name match is highest priority
      if (userData.firstName === nameLower) {
        score = 1.0;
      } 
      // First name contains or is contained in name
      else if (userData.firstName.includes(nameLower) || nameLower.includes(userData.firstName)) {
        score = 0.8;
      }
      // Full name contains the name
      else if (userData.fullName.includes(nameLower)) {
        score = 0.7;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = userData.user;
      }
    }
    
    if (bestMatch && bestScore > 0.5) {
      matches[name] = bestMatch;
    }
  });
  
  console.log('Found matches:', Object.keys(matches).length);
  return matches;
}

// Skip user verification and accept best effort matching
export function verifyNames(text: string, motionUsers: any[] | undefined) {
  // We no longer stop for verification, just use auto-matching
  return null;
}
