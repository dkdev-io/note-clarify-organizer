
/**
 * Utility functions for task parsing
 */

// Function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Function to convert conversational text to task-oriented language
export const convertToTaskLanguage = (text: string): string => {
  let taskText = text;
  
  // Replace conversational phrases with task-oriented language
  const conversationalPatterns = [
    { pattern: /\b(\w+) (?:mentioned|said|suggested|asked|requested|thought|wants) (?:that|if|to|we should|we could|we need to|we might|about|for) /gi, replacement: '' },
    { pattern: /\b(?:I think|We should|Maybe we can|We could|Let's|I suggest|What if we|How about we|We need to) /gi, replacement: '' },
    { pattern: /\b(?:discussed|talking about|mentioned) /gi, replacement: '' },
    { pattern: /\bwe need someone to\b/gi, replacement: '' },
    { pattern: /\bjust a reminder\b/gi, replacement: '' },
    { pattern: /\bdon't forget to\b/gi, replacement: '' },
    { pattern: /\b(?:it would be good|it would be nice|it would be great|it would be helpful) if\b/gi, replacement: '' }
  ];
  
  // Apply conversational replacements
  for (const { pattern, replacement } of conversationalPatterns) {
    taskText = taskText.replace(pattern, replacement);
  }
  
  // Convert passive voice to imperative/active voice
  taskText = taskText
    .replace(/\bshould be\s+(\w+ed)\b/gi, (match, verb) => `${verb}`)
    .replace(/\bneeds? to be\s+(\w+ed)\b/gi, (match, verb) => `${verb}`)
    .replace(/\bhas to be\s+(\w+ed)\b/gi, (match, verb) => `${verb}`)
    .replace(/\bwill be\s+(\w+ed)\b/gi, (match, verb) => `${verb}`)
    .replace(/\bmust be\s+(\w+ed)\b/gi, (match, verb) => `${verb}`);
  
  // Start with imperative verbs for tasks
  taskText = taskText
    .replace(/\bwe should\b/gi, '')
    .replace(/\bwe need to\b/gi, '')
    .replace(/\bwe must\b/gi, '')
    .replace(/\bwe have to\b/gi, '')
    .replace(/\byou should\b/gi, '')
    .replace(/\byou need to\b/gi, '')
    .replace(/\byou must\b/gi, '')
    .replace(/\byou have to\b/gi, '');
  
  // Remove filler words
  taskText = taskText
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bbasically\b/gi, '')
    .replace(/\bactually\b/gi, '')
    .replace(/\bhowever\b/gi, '')
    .replace(/\btherefore\b/gi, '')
    .replace(/\bso\b/gi, '')
    .replace(/\bjust\b/gi, '')
    .replace(/\bvery\b/gi, '')
    .replace(/\breally\b/gi, '')
    .replace(/\bpretty\b/gi, '')
    .replace(/\ba bit\b/gi, '')
    .replace(/\bkind of\b/gi, '')
    .replace(/\bsort of\b/gi, '');
  
  // Capitalize first letter if it's not already
  if (taskText.length > 0) {
    taskText = taskText.charAt(0).toUpperCase() + taskText.slice(1);
  }
  
  return taskText;
};

// Filter out common meeting phrases and greetings
export const filterMeetingChatter = (line: string): boolean => {
  const chatterPatterns = [
    /^(?:hi\s+(?:all|everyone|team)|hello\s+(?:all|everyone|team)|thanks|thank\s+you|regards|sincerely|cheers|best|great\s+meeting)/i,
    /\b(?:good morning|good afternoon|welcome everyone|thanks for joining|let's get started|to summarize|in summary|moving on|next item|any questions)\b/i,
    /\b(?:meeting adjourned|that's all for today|see you next time|talk soon|bye everyone|have a good day)\b/i,
    /^attendance:?/i,
    /^present:?/i,
    /^absent:?/i,
    /^(?:date|time):?/i
  ];
  
  return !chatterPatterns.some(pattern => pattern.test(line)) && line.trim().length > 0;
};

// Check if text is an introduction/header rather than a task
export const isIntroductionText = (text: string): boolean => {
  // Skip if it's empty or too short
  if (!text.trim() || text.length < 10) return true;
  
  // Check for common intro patterns
  const introPatterns = [
    /^(?:welcome|hello|hi|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening)/i,
    /^(?:agenda|topics|discussion\s+items|minutes|notes|action\s+items|to-dos?|next\s+steps)/i,
    /^(?:meeting|call|discussion|session|workshop|brainstorm)\s+(?:notes|minutes|summary|recap)/i,
    /^(?:team|project|department|company|group|committee)\s+(?:update|status|meeting|sync)/i,
    /^(?:date|time|location|venue|participants|attendees|present):/i,
    /^(?:overview|introduction|background|context|summary|recap|review)/i,
    /^(?:here\'s|attached|please\s+find|sending|sharing)/i,  // Common email/message starters
    /^(?:our|the)\s+(?:plan|notes|agenda|schedule|timeline|roadmap)\s+(?:for|on|about|regarding)/i,  // Common document starters
  ];
  
  if (introPatterns.some(pattern => pattern.test(text))) {
    return true;
  }
  
  // Improved checking for project announcements and introductions
  // These look like: "Here's our plan for the ABC project" or "Notes about the website redesign"
  const projectIntroPattern = /^(?:here\'s|this\s+is|attached\s+is|please\s+find|sending|sharing)?\s*(?:our|the|some|initial)?\s*(?:plan|notes|agenda|schedule|timeline|roadmap|overview|details|information|update|brief|proposal|thoughts|ideas|strategy|approach)(?:\s+for|\s+on|\s+about|\s+regarding)?\s+/i;
  
  if (projectIntroPattern.test(text)) {
    // This is likely an introduction to a project, not a task
    return true;
  }
  
  // Check if it's a heading with no verbs
  const isHeading = text.length < 50 && 
                   !/\b(?:need|must|should|will|can|have to|going to|shall)\b/i.test(text) &&
                   !/\b(?:create|update|review|prepare|schedule|organize|develop|design|implement|test|fix|build|draft|edit|add|remove|change|modify|analyze|evaluate|assess|report|present|discuss|meet|call|email|post|share|upload|download|generate|produce|deliver|submit|approve|verify|check|complete|finish|send|write)\b/i.test(text);
  
  return isHeading;
};
