
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

// Check if names in the text exist in the Motion users
export function findUnrecognizedNames(extractedNames: string[], motionUsers: any[]): string[] {
  if (!motionUsers || !Array.isArray(motionUsers) || motionUsers.length === 0) {
    return []; // Can't verify without user list
  }
  
  console.log('Checking names against Motion users:', extractedNames);
  
  const userNames = motionUsers.map(user => {
    // Get both full name and first name
    const fullName = user.name || '';
    const firstName = fullName.split(' ')[0].toLowerCase();
    return { fullName: fullName.toLowerCase(), firstName };
  }).filter(name => name.firstName); // Remove empty names
  
  return extractedNames.filter(name => {
    const nameLower = name.toLowerCase();
    
    // Check direct match with first names
    if (userNames.some(user => user.firstName === nameLower)) {
      return false; // Name is recognized
    }
    
    // Check full name match
    if (userNames.some(user => user.fullName.includes(nameLower))) {
      return false; // Name is recognized
    }
    
    // Check partial matches (e.g., "Dan" could match "Daniel")
    for (const userName of userNames) {
      // Check if name is contained in username or vice versa
      if (userName.firstName.includes(nameLower) || nameLower.includes(userName.firstName)) {
        if (nameLower.length > 2) { // Avoid matching single letters
          return false; // Name is potentially recognized
        }
      }
    }
    
    return true; // Name is not recognized
  });
}

// Handle name verification and return response if unrecognized names found
export function verifyNames(text: string, motionUsers: any[] | undefined) {
  if (motionUsers && Array.isArray(motionUsers) && motionUsers.length > 0) {
    const extractedNames = extractNamesFromText(text);
    console.log('Extracted potential names from text:', extractedNames);
    
    const unrecognizedNames = findUnrecognizedNames(extractedNames, motionUsers);
    
    if (unrecognizedNames.length > 0) {
      console.warn('Found unrecognized names:', unrecognizedNames);
      return new Response(
        JSON.stringify({ 
          unrecognizedNames, 
          tasks: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return null;
}
