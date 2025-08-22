
/**
 * Utilities for extracting task assignee from text
 */

// Function to extract assignee from text, with fallback to default user
export const extractAssignee = (text: string, defaultUser?: string): string | null => {
  if (!text) return defaultUser || null;
  
  // Patterns for different ways to mention assignees
  const assigneePatterns = [
    // Explicit assignment patterns
    /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+?)(?:,|\.|$)/i,
    /\b(?:assign(?:ed)?|give)\s+(?:to|for)?\s+([A-Za-z\s]+?)(?:,|\.|$)/i,
    
    // Possessive forms
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s\s+(?:task|responsibility|job|assignment)/i,
    
    // Action patterns - someone doing something (allow lowercase first letter)
    /\b([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\s+(?:needs|should|will|to|can|must|has to|is going to|is supposed to)\b/i,
    
    // "X is responsible for", "X is going to", etc.
    /\b([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\s+is\s+(?:responsible|going|supposed|expected)\b/i,
    
    // "X must finish/do/complete" etc.
    /\b([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\s+must\b/i,
    
    // Names in parentheses - common notation for assignees
    /\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\)/i,
    
    // @ mentions - common in many tools
    /@([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
    
    // First line beginning with name pattern
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:to|will|should|can|needs)/i
  ];
  
  for (const pattern of assigneePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Ensure we're not extracting conjunctions as part of the name
      const nameCandidate = match[1].trim();
      if (!/^(and|with|&|the|by|for|from|if|is|of|on|or|to)$/i.test(nameCandidate)) {
        console.log(`Found assignee '${nameCandidate}' using pattern:`, pattern);
        return nameCandidate;
      }
    }
  }
  
  // Handle names before conjunctions like "and" or "with" - take only the first name
  const conjunctionPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:and|with|&)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:needs|should|will|to|can|must)\b/i;
  const conjunctionMatch = text.match(conjunctionPattern);
  if (conjunctionMatch && conjunctionMatch[1]) {
    const nameCandidate = conjunctionMatch[1].trim();
    console.log(`Found assignee '${nameCandidate}' from conjunction pattern`);
    return nameCandidate;
  }
  
  // If no explicit assignee found, return default user (current Motion user)
  // Always default to the current user if no assignee is specified
  console.log(`No assignee found in text, using default user: ${defaultUser || 'Me'}`);
  return defaultUser || 'Me';
};
