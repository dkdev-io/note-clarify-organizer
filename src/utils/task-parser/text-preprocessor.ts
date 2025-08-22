/**
 * Preprocessor to intelligently join lines that belong together before parsing
 */

/**
 * Joins lines that appear to be part of the same task
 * This prevents breaking up tasks that span multiple lines
 */
export const preprocessTaskText = (text: string): string => {
  const lines = text.split(/\r?\n/);
  const processedLines: string[] = [];
  let currentTask = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (currentTask) {
        processedLines.push(currentTask);
        currentTask = '';
      }
      continue;
    }
    
    // Check if this line looks like a continuation of the previous line
    const isContinuation = 
      // Line starts with a date pattern (22nd, September 3rd, next Friday, etc.)
      /^(?:\d{1,2}(?:st|nd|rd|th)|(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:today|tomorrow|next|this))/i.test(line) ||
      // Line starts with a preposition that suggests continuation
      /^(?:by|before|after|until|till|on|at|in|for|to|with|from)\s+/i.test(line) ||
      // Line starts with lowercase (likely continuation)
      /^[a-z]/.test(line) ||
      // Line is just a date or time
      /^(?:\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{1,2}:\d{2}(?:\s*[ap]m)?|(?:morning|afternoon|evening|night))$/i.test(line);
    
    // Check if current line starts a new task (has task indicators)
    const startsNewTask = 
      // Bullet points or numbers
      /^[\-\*•]\s+/.test(line) ||
      /^\d+\.\s+/.test(line) ||
      // Starts with a capital letter and contains action words
      (/^[A-Z]/.test(line) && /\b(?:will|should|must|need|needs|has to|have to|going to|finish|complete|deliver|send|meet|call|email|review|prepare|create|update|fix)\b/i.test(line));
    
    if (currentTask && isContinuation && !startsNewTask) {
      // This line continues the previous task
      // Add a space if the previous doesn't end with a space
      if (!currentTask.endsWith(' ')) {
        currentTask += ' ';
      }
      currentTask += line;
    } else {
      // This starts a new task
      if (currentTask) {
        processedLines.push(currentTask);
      }
      currentTask = line;
    }
  }
  
  // Don't forget the last task
  if (currentTask) {
    processedLines.push(currentTask);
  }
  
  // Join with newlines to maintain structure
  return processedLines.join('\n');
};

/**
 * Checks if text should be kept as a single task (not split by periods)
 */
export const shouldKeepAsSingleTask = (text: string): boolean => {
  // If the text is short and contains a date at the end, keep it together
  if (text.length < 100) {
    const hasDateAtEnd = /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?:st|nd|rd|th)|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*$/i.test(text);
    if (hasDateAtEnd) return true;
  }
  
  // If it's a single sentence with "by/before [date]", keep it together
  const hasInlineDateDeadline = /\b(?:by|before|until|on)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|next|this|tomorrow|\d{1,2}(?:st|nd|rd|th))/i.test(text);
  if (hasInlineDateDeadline && !text.includes(' and ') && !text.includes(' then ')) {
    return true;
  }
  
  return false;
};