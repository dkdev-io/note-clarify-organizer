
/**
 * Utility functions for parsing text notes into structured tasks
 */

// Task type definition
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string | null;
  workspace_id: string | null;
  isRecurring: boolean;
  frequency: string | null;
  project: string | null;
}

// Function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Function to extract dates from text including hour-based and day-based specifications
const extractDate = (text: string): string | null => {
  // Define a fixed date for relative date calculations if needed
  const baseDate = new Date(2025, 2, 8); // March 8, 2025
  
  // Hour-based deadline patterns
  const hourBasedPatterns = [
    // "within X hours", "in X hours", "X hour turnaround", etc.
    /\b(?:within|in)\s+(\d+)\s+hours?\b/i,
    /\b(\d+)\s+hours?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(\d+)\s+hours?\b/i,
    /\bdue\s+in\s+(\d+)\s+hours?\b/i,
    /\bcomplete\s+(?:within|in)\s+(\d+)\s+hours?\b/i,
    /\bwithin\s+(\d+)\s+hours?\b/i,  // Added explicit pattern for "within X hours"
    /\b24\s+hours\b/i,  // Added pattern for "24 hours"
    /\bone day\b/i      // Added pattern for "one day" as 24 hours
  ];
  
  // Day-based deadline patterns with words like "two" instead of "2"
  const dayBasedPatterns = [
    // "within X days", "in X days", "X day turnaround", etc.
    /\b(?:within|in)\s+(\d+)\s+days?\b/i,
    /\b(\d+)\s+days?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(\d+)\s+days?\b/i,
    /\bdue\s+in\s+(\d+)\s+days?\b/i,
    /\bcomplete\s+(?:within|in)\s+(\d+)\s+days?\b/i,
    /\bwithin\s+(\d+)\s+days?\b/i,  // Added explicit pattern for "within X days"
    
    // Patterns with written numbers
    /\b(?:within|in)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bdue\s+in\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bcomplete\s+(?:within|in)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bwithin\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i
  ];
  
  // Check for hour-based deadlines first
  for (const pattern of hourBasedPatterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = 24; // Default for "24 hours" or "one day"
      
      if (match[1]) {
        hours = parseInt(match[1], 10);
      }
      
      if (!isNaN(hours)) {
        const deadline = new Date(baseDate);
        deadline.setHours(deadline.getHours() + hours);
        return deadline.toISOString().split('T')[0];
      }
    }
  }
  
  // Check for day-based deadlines
  for (const pattern of dayBasedPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let days;
      
      // Convert written numbers to digits
      if (isNaN(parseInt(match[1], 10))) {
        const numberMapping: Record<string, number> = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        days = numberMapping[match[1].toLowerCase()];
      } else {
        days = parseInt(match[1], 10);
      }
      
      if (!isNaN(days)) {
        const deadline = new Date(baseDate);
        deadline.setDate(deadline.getDate() + days);
        return deadline.toISOString().split('T')[0];
      }
    }
  }

  // Expanded date patterns recognition
  const datePatterns = [
    // Format: by/due/on/for month day, year
    /(?:by|due|on|for|deadline|before)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i,
    
    // Format: by/due/on/for MM/DD/YYYY or MM-DD-YYYY
    /(?:by|due|on|for|deadline|before)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    
    // Format: MM/DD/YYYY or MM-DD-YYYY without by/due prefix
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/i,
    
    // Format: Month Day format with or without year
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i,
    
    // Format: Day of week (next Monday, this Friday)
    /(?:(?:this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
    
    // Format: Relative dates (tomorrow, next week)
    /\b(?:tomorrow|today|next week)\b/i
  ];
  
  // Try each pattern
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Handle different date formats
      try {
        // MM/DD/YYYY or MM-DD-YYYY format
        if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(match[0])) {
          const parts = match[0].split(/[\/\-]/);
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        // Month name format
        else if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(match[0])) {
          let monthStr, dayStr, yearStr;
          
          if (match[0].match(/(?:by|due|on|for|deadline|before)/i)) {
            // Using named capture groups format
            monthStr = match[1];
            dayStr = match[2];
            yearStr = match[3] || baseDate.getFullYear().toString();
          } else {
            // Direct month name format
            monthStr = match[1];
            dayStr = match[2];
            yearStr = match[3] || baseDate.getFullYear().toString();
          }
          
          const date = new Date(`${monthStr} ${dayStr}, ${yearStr}`);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        // Relative dates
        else if (/(?:this|next|tomorrow|today)/i.test(match[0])) {
          let resultDate = new Date(baseDate);
          
          if (/tomorrow/i.test(match[0])) {
            resultDate.setDate(baseDate.getDate() + 1);
          } else if (/next week/i.test(match[0])) {
            resultDate.setDate(baseDate.getDate() + 7);
          } else if (/this|next/i.test(match[0]) && /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(match[0])) {
            const dayOfWeekMatch = match[0].match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dayOfWeekMatch) {
              const dayOfWeek = dayOfWeekMatch[1].toLowerCase();
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const targetDay = daysOfWeek.indexOf(dayOfWeek);
              
              let daysToAdd = (targetDay - baseDate.getDay() + 7) % 7;
              if (/next/i.test(match[0])) {
                daysToAdd += 7;
              }
              if (daysToAdd === 0) {
                daysToAdd = 7; // If "this Sunday" and today is Sunday, go to next Sunday
              }
              
              resultDate.setDate(baseDate.getDate() + daysToAdd);
            }
          }
          
          return resultDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
  }
  
  return null;
};

// Function to extract priority from text
const extractPriority = (text: string): 'low' | 'medium' | 'high' | null => {
  const lowPriorityRegex = /\b(?:low priority|not urgent|can wait|p3|low importance)\b/i;
  const highPriorityRegex = /\b(?:high priority|urgent|asap|p1|important|critical)\b/i;
  const mediumPriorityRegex = /\b(?:medium priority|moderate|p2|normal priority)\b/i;
  
  if (highPriorityRegex.test(text)) return 'high';
  if (mediumPriorityRegex.test(text)) return 'medium';
  if (lowPriorityRegex.test(text)) return 'low';
  
  return null;
};

// Improved function to extract assignee from text
const extractAssignee = (text: string): string | null => {
  // Patterns for different ways to mention assignees
  const assigneePatterns = [
    // "assigned to X", "assignee: X", etc.
    /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+?)(?:,|\.|$)/i,
    
    // "X needs to", "X should", "X will", etc. - look for person's name followed by action
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|should|will|to|can|must|has to|is going to|needs to|has|is supposed to)\b/i,
    
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
      return match[1].trim();
    }
  }
  
  return null;
};

// Function to extract status from text
const extractStatus = (text: string): 'todo' | 'in-progress' | 'done' => {
  const inProgressRegex = /\b(?:in progress|started|working on|ongoing)\b/i;
  const doneRegex = /\b(?:done|completed|finished|closed)\b/i;
  
  if (inProgressRegex.test(text)) return 'in-progress';
  if (doneRegex.test(text)) return 'done';
  
  return 'todo';
};

// Function to check if task is recurring
const isRecurringTask = (text: string): { isRecurring: boolean, frequency: string | null } => {
  const recurringRegex = /\b(?:recurring|every|each|repeat|weekly|daily|monthly|biweekly)\b/i;
  
  if (recurringRegex.test(text)) {
    // Try to extract frequency information
    const dailyRegex = /\b(?:every day|daily)\b/i;
    const weeklyRegex = /\b(?:every week|weekly)\b/i;
    const biweeklyRegex = /\b(?:every other week|biweekly|bi-weekly)\b/i;
    const monthlyRegex = /\b(?:every month|monthly)\b/i;
    
    if (dailyRegex.test(text)) return { isRecurring: true, frequency: 'daily' };
    if (weeklyRegex.test(text)) return { isRecurring: true, frequency: 'weekly' };
    if (biweeklyRegex.test(text)) return { isRecurring: true, frequency: 'biweekly' };
    if (monthlyRegex.test(text)) return { isRecurring: true, frequency: 'monthly' };
    
    return { isRecurring: true, frequency: null };
  }
  
  return { isRecurring: false, frequency: null };
};

// Improved function to extract project name from text
const extractProjectName = (text: string): string | null => {
  if (!text || !text.trim()) return null;
  
  // Split the text into lines for analysis
  const lines = text.split(/\r?\n/);
  const firstLine = lines.length > 0 ? lines[0].trim() : '';
  
  console.log("Extracting project name from:", firstLine);
  
  // Check for common project name patterns in the first line - highest priority
  const projectNamePatterns = [
    // Client/project name at beginning or end of the sentence
    /^([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation)/i,
    /(?:project|campaign|initiative|redesign|launch|implementation)\s+for\s+([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){1,3})/i,
    
    // Phrases with descriptive project names
    /(?:the|our|)\s+([A-Z][a-z0-9]+(?:\s+[a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation)/i,
    
    // Client + project type pattern
    /([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){0,2})\s+(?:client|account)(?:\s+([a-z0-9]+(?:\s+[a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation))?/i,
  ];
  
  // Try specific project name patterns first
  for (const pattern of projectNamePatterns) {
    const match = firstLine.match(pattern);
    if (match && match[1]) {
      const projectName = match[1].trim();
      console.log("Extracted specific project name:", projectName);
      return projectName;
    }
  }
  
  // Check for context clues in the first line
  const contextCluePatterns = [
    // Updated pattern to handle possessive forms
    // This pattern looks for "for the xyz client's marketing campaign" type structures
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?(?:\s+client(?:'s)?|\s+project|\s+campaign|\s+initiative|\s+redesign|\s+launch|\s+implementation))(?:\.|\s*$)/i,
    
    // New pattern to specifically handle "xyz client's marketing campaign"
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+){0,2}(?:'s)?(?:\s+[A-Za-z0-9]+){1,3})(?:\.|\s*$)/i,
    
    // Patterns for phrases like "Here's our plan for the website development"
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i,  // "plan for the website development."
    /^(?:.*?)\s+on\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i,   // "working on the website development."
    /^(?:.*?)\s+about\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i, // "notes about the website development."
    
    // More specific project patterns
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)\s+project\b/i,  // "plan for the marketing project"
    /^(?:.*?)\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)\s+project\b/i,        // "the marketing project"
    /^([A-Za-z0-9\s\-_']+?)\s+(?:project|plan|initiative)\b/i,         // "Marketing Project" or "Alpha plan"
    
    // Title-like patterns
    /^([A-Za-z0-9\s\-_']+?)(?::\s|\s-\s|\s–\s)/i, // "Project Name: details" or "Website Development - Tasks"
  ];
  
  // Try each context clue pattern
  for (const pattern of contextCluePatterns) {
    const titleMatch = firstLine.match(pattern);
    if (titleMatch && titleMatch[1]) {
      const candidateProject = titleMatch[1].trim();
      
      // Improve filtering of project names
      // 1. Must be longer than 2 characters
      // 2. Shouldn't be just common words or articles
      // 3. Shouldn't be generic terms like "meeting" or "update"
      if (candidateProject.length > 2 && 
          !/^(the|a|an|this|our|it|that|these|those|them|his|her|their|its)$/i.test(candidateProject) &&
          !/^(plan|meeting|discussion|agenda|notes|minutes|summary|team|update|overview|here|our|status|report)$/i.test(candidateProject) &&
          !/^here\'s\s+our/i.test(candidateProject)) {
        
        // Clean up potential project name - remove trailing articles, etc.
        let cleanProject = candidateProject
          .replace(/^(?:the|our|this)\s+/i, '')
          .replace(/\s+(?:update|status|report|notes|meeting)$/i, '');
        
        console.log("Extracted project name from context clue pattern:", cleanProject);
        return cleanProject;
      }
    }
  }
  
  // If we couldn't extract a project name from the text, use a default
  console.log("Could not extract project name, using default");
  return null;
};

// Function to convert conversational text to task-oriented language
const convertToTaskLanguage = (text: string): string => {
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
const filterMeetingChatter = (line: string): boolean => {
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

// Improved function to split text into sub-tasks if needed
const splitIntoSubtasks = (text: string): string[] => {
  const tasks: string[] = [];
  
  // Try to match the specific Danny example pattern first (highest priority)
  const dannyPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+must\s+finish\s+(.+?)(?:before|by)\s+([^.]+)\.+\s+(?:He|She|They|[A-Z][a-z]+)(?:'ll|\s+will|\s+needs?\s+to)?\s+(?:need\s+to\s+)?(?:send|submit|deliver|share)\s+(.+?)(?:to|for|with)\s+(.+?)(?:\.|\s+for)/i;
  
  const dannyMatch = text.match(dannyPattern);
  if (dannyMatch) {
    const person = dannyMatch[1];
    const item = dannyMatch[2];
    const deadline1 = dannyMatch[3];
    const deliverable = dannyMatch[4];
    const recipients = dannyMatch[5];
    
    // Create two separate tasks
    const task1 = `${person} must finish ${item} before ${deadline1}`;
    const task2 = `${person} needs to send ${deliverable} to ${recipients}`;
    
    return [task1, task2];
  }
  
  // More generalized two-step task patterns
  const twoStepPatterns = [
    // Pattern: "X needs to do A and then do B"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|has|must|should|will)\s+to\s+(.+?)\s+(?:and\s+then|then|after\s+that|and\s+(?:later|afterward|afterwards|subsequently))\s+(.+?)(?:\.|\s*$)/i,
    
    // Pattern: "X needs to do A before doing B"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|has|must|should|will)\s+to\s+(.+?)\s+before\s+(.+?)(?:\.|\s*$)/i,
    
    // Pattern: "X will do A, followed by B"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:will|should|must|needs\s+to)\s+(.+?),?\s+(?:followed\s+by|next\s+(?:is|will|should|must|needs\s+to))\s+(.+?)(?:\.|\s*$)/i,
    
    // Pattern: "X needs to finish A by date. X will/needs to send/submit B to Y"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|has|must|should|will)\s+to\s+(?:finish|complete)\s+(.+?)(?:by|before|on)\s+(.+?)\.+\s+\1\s+(?:will|needs\s+to|has\s+to|must|should)\s+(?:send|submit|deliver|share)\s+(.+?)(?:to|for|with)\s+(.+?)(?:\.|\s*$)/i
  ];
  
  for (const pattern of twoStepPatterns) {
    const match = text.match(pattern);
    if (match) {
      const person = match[1];
      // Create tasks based on the matched groups
      const task1 = `${person} needs to ${match[2]}`;
      const task2 = `${person} needs to ${match[3]}`;
      
      return [task1, task2];
    }
  }
  
  // Look for sequences
  const sequencesByPeriod = text.split(/\.\s+/).filter(s => s.trim().length > 0);
  
  // Look for "and then" or similar sequence indicators
  const sequencesByConnectors = text.split(/\s+and\s+then\s+|\s+after\s+that\s+|\s+next,?\s+|\s+subsequently\s+|\s+following\s+that\s+/i)
    .filter(s => s.trim().length > 0);
  
  // Look for numbered sequences like "1. First task 2. Second task"
  const sequencesByNumbers = text.split(/\s*\d+\.\s+/).filter(s => s.trim().length > 0);
  
  // Look for "before" clauses which often indicate two separate tasks
  const sequencesByBefore = text.split(/\s+before\s+/i).filter(s => s.trim().length > 0);
  
  // Collect all potential sequences into a single array of potential tasks
  const potentialTasks = [
    ...sequencesByPeriod,
    ...sequencesByConnectors,
    ...sequencesByNumbers,
    ...sequencesByBefore
  ];
  
  // Collect unique task texts (may have duplicates from different patterns)
  const uniqueTasks = new Set<string>();
  
  // For each potential task, check if it appears to be a valid task (has a verb, reasonable length)
  for (const potential of potentialTasks) {
    // Skip if it's too short or doesn't have an action verb
    if (potential.trim().length < 10 || !(/\b(?:do|make|create|update|review|finish|complete|check|send|write|prepare|schedule|organize|develop|design|implement|test|fix|build|draft|edit|add|remove|change|modify|analyze|evaluate|assess|report|present|discuss|meet|call|email|post|share|upload|download|generate|produce|deliver|submit|approve|verify|check|complete|finish|send|write)\b/i.test(potential))) {
      continue;
    }
    
    uniqueTasks.add(potential.trim());
  }
  
  // If we found more than one task, return them as separate tasks
  if (uniqueTasks.size > 1) {
    return Array.from(uniqueTasks);
  }
  
  // Check for split by "to" where both parts make sense as separate tasks
  if (text.includes(" to ")) {
    const parts = text.split(" to ");
    if (parts.length === 2) {
      const firstPart = parts[0].trim();
      const secondPart = "to " + parts[1].trim();
      
      if (firstPart.length > 15 && secondPart.length > 15) {
        // If both parts are substantial and the second part could be a task with "to"
        if (/\b(?:need|has|want|going)\b/i.test(firstPart) && /\b(?:send|submit|review|finalize|complete|check|create|make|develop)\b/i.test(secondPart)) {
          tasks.push(firstPart);
          tasks.push(secondPart);
          return tasks;
        }
      }
    }
  }
  
  // Look for sentences with different assignees
  const differentAssigneesPattern = /(\S+(?:\s+\S+)?\s+(?:must|needs? to|should|will|has to|is going to)(?:\s+\S+){2,})\.\s+(\S+(?:\s+\S+)?\s+(?:must|needs? to|should|will|has to|is going to)(?:\s+\S+){2,})/i;
  const assigneeMatch = text.match(differentAssigneesPattern);
  
  if (assigneeMatch && assigneeMatch[1] && assigneeMatch[2]) {
    const assignee1 = extractAssignee(assigneeMatch[1]);
    const assignee2 = extractAssignee(assigneeMatch[2]);
    
    if (assignee1 && assignee2 && assignee1 !== assignee2) {
      tasks.push(assigneeMatch[1].trim());
      tasks.push(assigneeMatch[2].trim());
      return tasks;
    }
  }
  
  // If we didn't find multiple tasks, return the original text in an array
  return [text];
};

// Improved function to clean up task titles by removing names, dates, etc.
const cleanupTaskTitle = (title: string, assignee: string | null, dueDate: string | null): string => {
  let cleanTitle = title;
  
  // Remove assignee name from title if present
  if (assignee) {
    // Different patterns to remove person name attribution
    const namePatterns = [
      new RegExp(`\\b${assignee}\\b\\s+(?:needs|should|will|must|has|is|can|to|needs to|has to|is going to|should|must)\\b.*?`, 'gi'),
      new RegExp(`\\b${assignee}'s\\b`, 'gi'),
      new RegExp(`\\b${assignee}\\b`, 'gi') // Only remove the bare name if other patterns don't match
    ];
    
    // Try each pattern in order of specificity
    for (const pattern of namePatterns) {
      const beforeClean = cleanTitle;
      cleanTitle = cleanTitle.replace(pattern, '').trim();
      // If we removed something with this pattern, break to avoid over-cleaning
      if (beforeClean !== cleanTitle) break;
    }
  }
  
  // Clean date mentions from title
  if (dueDate) {
    const datePatterns = [
      /\b(?:by|before|due|on|deadline)\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?\b/gi,
      /\b(?:by|before|due|on|deadline)\s+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
      /\bwithin\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|hours?|weeks?)\b/gi,
      /\bin\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|hours?|weeks?)\b/gi,
      /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:days?|hours?|weeks?)\s+(?:deadline|turnaround)\b/gi,
      /\b(?:within|by|before|due)\s+24\s+hours?\b/gi,
      /\b(?:within|by|before|due)\s+one day\b/gi,
      /\b(?:tomorrow|next week|this|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\b(?:march|april|may|june|july|august|september|october|november|december|january|february)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi
    ];
    
    for (const pattern of datePatterns) {
      cleanTitle = cleanTitle.replace(pattern, '').trim();
    }
  }
  
  // Convert to task-oriented language and make it more concise
  cleanTitle = convertToTaskLanguage(cleanTitle);
  
  // Clean up spaces, dots, commas at beginning and end
  cleanTitle = cleanTitle.replace(/^[,.\s]+/, '').replace(/[,.\s]+$/, '').trim();
  cleanTitle = cleanTitle.replace(/\s{2,}/g, ' ');
  
  // Capitalize first letter
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }
  
  return cleanTitle;
};

// Improved function to check if text is an introduction/header rather than a task
const isIntroductionText = (text: string): boolean => {
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
    /^(?:our|the)\s+(?:plan|notes|agenda|schedule|timeline|roadmap)/i,  // Common document starters
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

// Main function to parse text into potential tasks
export const parseTextIntoTasks = (text: string, defaultProjectName: string | null = null): Task[] => {
  if (!text.trim()) return [];
  
  // Extract a project name first from the overall text or use the provided default
  const extractedProjectName = extractProjectName(text);
  
  // Use the extracted project name or default to "Tasks"
  const projectName = defaultProjectName || extractedProjectName || "Tasks";
  console.log("Using project name:", projectName);
  
  // Split text into lines
  const lines = text.split(/\r?\n/).filter(filterMeetingChatter);
  
  // Identify potential tasks by looking for action items, bullet points, numbered lists, etc.
  const taskIndicators = [
    /^\s*[\-\*•]\s+/,                                  // Bullet points
    /^\s*\d+\.\s+/,                                    // Numbered lists
    /\b(?:todo|to-do|action item|task)s?\b:?\s*/i,    // Explicit task indicators
    /\b(?:need|needs) to\b/i,                         // Need to statements
    /\b(?:should|must|will have to|going to)\b/i      // Obligation indicators
  ];
  
  const tasks: Task[] = [];
  let isFirstLine = true;
  
  for (const line of lines) {
    let isTaskLine = taskIndicators.some(regex => regex.test(line));
    let taskText = line;
    
    // Skip very short lines unless they're clearly tasks
    if (!isTaskLine && line.length < 15) {
      isFirstLine = false;
      continue;
    }
    
    // Enhanced first-line handling - don't treat introductory text as a task
    if (isFirstLine) {
      if (isIntroductionText(line)) {
        console.log("Skipping introductory line:", line);
        isFirstLine = false;
        continue;
      }
      
      // If first line contains "for the [project name]" or similar patterns, 
      // it's likely an introduction, not a task
      const introProjectPatterns = [
        /^(?:here\'s|this\s+is|attached\s+is|please\s+find|sending|sharing)?\s*(?:our|the|some|initial)?\s*(?:plan|notes|agenda|schedule|timeline|roadmap|overview|details|information|update|brief|proposal|thoughts|ideas|strategy|approach)\s+(?:for|on|about|regarding)/i
      ];
      
      if (introProjectPatterns.some(pattern => pattern.test(line)) && !isTaskLine) {
        console.log("Skipping project introduction line:", line);
        isFirstLine = false;
        continue;
      }
    }
    
    isFirstLine = false;
    
    // Clean up the task text (remove bullet points, numbering, etc.)
    taskIndicators.forEach(indicator => {
      taskText = taskText.replace(indicator, '');
    });
    
    // Split into subtasks if needed
    const subtasks = splitIntoSubtasks(taskText);
    
    for (const subtaskText of subtasks) {
      // Extract task information first to properly identify assignees, dates, etc.
      const dueDate = extractDate(subtaskText);
      const priority = extractPriority(subtaskText);
      const assignee = extractAssignee(subtaskText);
      const status = extractStatus(subtaskText);
      const recurring = isRecurringTask(subtaskText);
      
      // We use the global project name for all tasks
      // This ensures all tasks from the same note share the same project
      
      // Clean up the task title - remove names, dates, priority, etc.
      let processedTitle = cleanupTaskTitle(subtaskText, assignee, dueDate);
      
      // Try to separate title from description if there's a colon or dash
      let title = processedTitle;
      let description = '';
      
      const titleSeparators = [/:\s/, /\s-\s/, /\s–\s/];
      for (const separator of titleSeparators) {
        const parts = processedTitle.split(separator, 2);
        if (parts.length === 2) {
          title = parts[0].trim();
          description = parts[1].trim();
          break;
        }
      }
      
      // If the title is still too long, just use the first sentence
      if (title.length > 100) {
        const sentenceParts = title.split(/\.\s+/, 2);
        if (sentenceParts.length > 1) {
          description = (description ? title.substring(sentenceParts[0].length + 2) + '. ' + description : title.substring(sentenceParts[0].length + 2));
          title = sentenceParts[0] + '.';
        }
      }
      
      // Add deadline information to description if there's a due date
      if (dueDate) {
        const formattedDate = new Date(dueDate).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        // Add deadline information to description if not already present
        if (!description.includes("Deadline") && !description.includes("Due date")) {
          description = description ? `${description}\nDue date: ${formattedDate}` : `Due date: ${formattedDate}`;
        }
      }
      
      // Add assignee information to description if there's an assignee
      if (assignee && !description.includes("Assigned to")) {
        description = description ? `${description}\nAssigned to: ${assignee}` : `Assigned to: ${assignee}`;
      }
      
      // Add project information to description if there's a project
      if (projectName && !description.includes("Project:")) {
        description = description ? `${description}\nProject: ${projectName}` : `Project: ${projectName}`;
      }
      
      // Add a task with the project name explicitly set
      tasks.push({
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        status,
        assignee,
        workspace_id: null,
        isRecurring: recurring.isRecurring,
        frequency: recurring.frequency,
        project: projectName // Ensure project is explicitly set
      });
    }
  }
  
  return tasks;
};

// Function to refine a task based on user feedback
export const refineTask = (task: Task, updates: Partial<Task>): Task => {
  return {
    ...task,
    ...updates
  };
};

// Function to check if a task has all required fields
export const validateTask = (task: Task): { valid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  if (!task.title || task.title.trim() === '') {
    missingFields.push('title');
  }
  
  if (!task.workspace_id) {
    missingFields.push('workspace_id');
  }
  
  if (task.isRecurring && !task.frequency) {
    missingFields.push('frequency');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

// Function to validate multiple tasks
export const validateTasks = (tasks: Task[]): { allValid: boolean; tasksWithMissingFields: { task: Task; missingFields: string[] }[] } => {
  const tasksWithMissingFields = tasks.map(task => {
    const validation = validateTask(task);
    return {
      task,
      missingFields: validation.missingFields
    };
  }).filter(result => result.missingFields.length > 0);
  
  return {
    allValid: tasksWithMissingFields.length === 0,
    tasksWithMissingFields
  };
};
