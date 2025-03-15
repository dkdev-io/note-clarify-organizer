
/**
 * Utilities for extracting task assignee from text
 */

// Function to extract assignee from text
export const extractAssignee = (text: string): string | null => {
  // Patterns for different ways to mention assignees
  const assigneePatterns = [
    // "assigned to X", "assignee: X", etc.
    /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+?)(?:,|\.|$)/i,
    
    // Handle names before conjunctions like "and" or "with" - take only the first name
    /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:and|with|&)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:needs|should|will|to|can|must|has to|is going to|has|is supposed to)\b/i,
    
    // "X needs to", "X should", "X will", etc. - look for person's name followed by action
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|should|will|to|can|must|has to|is going to)\b/i,
    
    // "X is responsible for", "X is going to", etc.
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+is\s+(?:responsible|going|supposed|expected)\b/i,
    
    // "X must finish/do/complete" etc.
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+must\b/i,
    
    // Extra pattern for Jennifer-style names
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s\b/i
  ];
  
  for (const pattern of assigneePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Ensure we're not extracting conjunctions as part of the name
      const nameCandidate = match[1].trim();
      if (!/^(and|with|&)$/i.test(nameCandidate)) {
        return nameCandidate;
      }
    }
  }
  
  return null;
};
