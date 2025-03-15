
/**
 * Utilities for extracting task duration from text
 */

// Function to extract duration from text
export const extractDuration = (text: string): string | null => {
  // Patterns for different ways to mention duration
  const durationPatterns = [
    // "This will take X hours/minutes/days"
    /\b(?:this|it)\s+will\s+take\s+([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\b/i,
    
    // "X hours/minutes/days to complete"
    /\b([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\s+to\s+(?:complete|finish|do)\b/i,
    
    // "Estimated time: X hours/minutes/days"
    /\bestimated\s+time:?\s+([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\b/i,
    
    // "Duration: X hours/minutes/days"
    /\bduration:?\s+([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\b/i,
    
    // "Takes X hours/minutes/days"
    /\btakes\s+([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\b/i,
    
    // Generic pattern with time units
    /\b([a-zA-Z0-9\s-]+)(?:\s+(?:hours?|hrs?|minutes?|mins?|days?))\b/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Get the full duration phrase including the time unit
      const durationPhrase = match[0].trim();
      
      // Check if the duration phrase contains actual time units
      if (/(?:hours?|hrs?|minutes?|mins?|days?)/.test(durationPhrase)) {
        return durationPhrase;
      }
    }
  }
  
  return null;
};
