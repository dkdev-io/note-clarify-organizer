
/**
 * Utilities for extracting task priority from text
 */

// Function to extract priority from text
export const extractPriority = (text: string): 'low' | 'medium' | 'high' | null => {
  const lowPriorityRegex = /\b(?:low priority|not urgent|can wait|p3|low importance)\b/i;
  const highPriorityRegex = /\b(?:high priority|urgent|asap|p1|important|critical)\b/i;
  const mediumPriorityRegex = /\b(?:medium priority|moderate|p2|normal priority)\b/i;
  
  if (highPriorityRegex.test(text)) return 'high';
  if (mediumPriorityRegex.test(text)) return 'medium';
  if (lowPriorityRegex.test(text)) return 'low';
  
  return null;
};
