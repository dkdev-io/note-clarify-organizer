
/**
 * Utilities for extracting potential names from text
 */

/**
 * Extract potential names from text
 * This looks for words that might be names based on common patterns
 * in task assignments and mentions
 */
export function extractPotentialNames(text: string): string[] {
  if (!text) return [];
  
  // More comprehensive patterns to catch different ways people are assigned tasks
  const patterns = [
    // Common task assignment patterns
    /(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)\s+(?:will|needs? to|should|is going to|must|has to|can|shall)\b/g,
    /\b(?:assign(?:ed)?|give)\s+(?:to|for)?\s+(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)/gi,
    /\b(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)'s\s+(?:task|responsibility|job|assignment)/gi,
    /\bask\s+(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)\s+to\b/gi,
    
    // Colons and task assignments
    /\b(?:assignee|assigned to|owner|responsible):\s*(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)/gi,
    
    // Beginning of line with capitalized name followed by action verb
    /^(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)\s+(?:to|will|should|must|can|needs)/gm,
    
    // Names in parentheses (common notation in notes)
    /\((\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)\)/g,
    
    // Names with @ mentions (common in chat/collaboration tools)
    /@(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b)/g
  ];
  
  let allNames: string[] = [];
  
  // Extract names using all patterns
  patterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    const names = matches.map(match => match[1].trim());
    allNames = [...allNames, ...names];
  });
  
  // Special case for detecting standalone names (capitalized words that aren't common English words)
  const commonWords = [
    'The', 'A', 'An', 'And', 'But', 'Or', 'For', 'Nor', 'On', 'At', 'To', 'From', 
    'By', 'With', 'In', 'Out', 'About', 'Before', 'After', 'During', 'Throughout',
    'Through', 'Because', 'Although', 'Since', 'Unless', 'However', 'Therefore',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December', 'Task', 'Project', 'Meeting',
    'Call', 'Email', 'Report', 'Update', 'Review', 'Create', 'Implement', 'Develop',
    'Design', 'Test', 'Launch', 'Start', 'Finish', 'Complete', 'Plan', 'Schedule',
    'Follow', 'Draft', 'This', 'That', 'These', 'Those', 'High', 'Medium', 'Low',
    'Priority', 'Status', 'Due', 'Date', 'Deadline', 'Time', 'Duration'
  ];
  
  // Look for standalone capitalized words that might be names
  const words = text.split(/\s+/);
  words.forEach(word => {
    // Clean up the word (remove punctuation)
    const cleanWord = word.replace(/[^\w\s]/g, '');
    
    // Check if it looks like a name (capitalized and not a common word)
    if (cleanWord.length > 0 && 
        /^[A-Z][a-z]+$/.test(cleanWord) && 
        !commonWords.includes(cleanWord)) {
      allNames.push(cleanWord);
    }
  });
  
  // Remove duplicates and filter out very short names (likely not real names)
  const uniqueNames = [...new Set(allNames)].filter(name => name.length >= 2);
  
  console.log("Extracted potential names:", uniqueNames);
  return uniqueNames;
}
