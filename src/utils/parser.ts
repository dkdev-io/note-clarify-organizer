
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
    /\bwithin\s+(\d+)\s+hours?\b/i  // Added explicit pattern for "within X hours"
  ];
  
  // Day-based deadline patterns
  const dayBasedPatterns = [
    // "within X days", "in X days", "X day turnaround", etc.
    /\b(?:within|in)\s+(\d+)\s+days?\b/i,
    /\b(\d+)\s+days?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(\d+)\s+days?\b/i,
    /\bdue\s+in\s+(\d+)\s+days?\b/i,
    /\bcomplete\s+(?:within|in)\s+(\d+)\s+days?\b/i,
    /\bwithin\s+(\d+)\s+days?\b/i   // Added explicit pattern for "within X days"
  ];
  
  // Check for hour-based deadlines first
  for (const pattern of hourBasedPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const hours = parseInt(match[1], 10);
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
      const days = parseInt(match[1], 10);
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
    /(?:by|due|on|for|deadline)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i,
    
    // Format: by/due/on/for MM/DD/YYYY or MM-DD-YYYY
    /(?:by|due|on|for|deadline)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    
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
          
          if (match[0].match(/(?:by|due|on|for|deadline)/i)) {
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
    /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+)(?:,|\.|$)/i,
    
    // "X needs to", "X should", "X will", etc. - look for person's name followed by action
    /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:needs|should|will|to|can|must)\b/i,
    
    // "X is responsible for", "X is going to", etc.
    /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+is\s+(?:responsible|going|supposed|expected)\b/i
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

// Function to extract project name from text
const extractProjectName = (text: string): string | null => {
  const projectIndicators = [
    /project\s*(?:name|title)?[:\s]+([^,.;]+)/i,
    /for project[:\s]+([^,.;]+)/i,
    /project[:\s]+([^,.;]+)/i,
    /\[project[:\s]+([^\]]+)\]/i,
    /re:[:\s]+([^,.;]+)/i,
    /#([a-zA-Z0-9_-]+)/,  // Hashtag style project names
    /meeting(?:\s+for|\s+about|\s+on|\s*:)?\s+([^,.;:]+)(?:\s*:)?/i, // Meeting for/about Project X
    /^([^:]{3,30}):\s*$/m  // Standalone lines that might be titles/headers
  ];
  
  // First look at the beginning of the text for a title/subject line
  const lines = text.split(/\r?\n/);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    
    // If first line has "Meeting:", "Project:", etc.
    if (/^(?:meeting|project|sprint|planning|review)(?:\s+for|\s+on|\s+about|\s*:)?\s+(.+)$/i.test(firstLine)) {
      const match = firstLine.match(/^(?:meeting|project|sprint|planning|review)(?:\s+for|\s+on|\s+about|\s*:)?\s+(.+)$/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If the first line is short and doesn't look like a task, it might be a title
    if (firstLine.length < 50 && !firstLine.match(/^[\-\*•]/) && !firstLine.match(/^\d+\./)) {
      return firstLine;
    }
  }
  
  // Try each pattern
  for (const pattern of projectIndicators) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
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
  
  // Convert statements with names into a more standardized format
  // e.g., "John will update the document" -> "Update the document. Assigned to: John"
  const namePattern = /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:will|should|needs to|is going to|has to)\s+(.+?)(?:\.|$)/gi;
  taskText = taskText.replace(namePattern, (match, name, action) => {
    return `${action.trim().charAt(0).toUpperCase() + action.trim().slice(1)}. Assigned to: ${name.trim()}`;
  });
  
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

// Main function to parse text into potential tasks
export const parseTextIntoTasks = (text: string): Task[] => {
  if (!text.trim()) return [];
  
  // Try to extract a project name from the overall text
  const overallProjectName = extractProjectName(text);
  
  // Split text into lines
  const lines = text.split(/\r?\n/).filter(filterMeetingChatter);
  
  // Identify potential tasks by looking for action items, bullet points, numbered lists, etc.
  const taskIndicators = [
    /^\s*[\-\*•]\s+/,                                   // Bullet points
    /^\s*\d+\.\s+/,                                    // Numbered lists
    /\b(?:todo|to-do|action item|task)s?\b:?\s*/i,    // Explicit task indicators
    /\b(?:need|needs) to\b/i,                         // Need to statements
    /\b(?:should|must|will have to|going to)\b/i      // Obligation indicators
  ];
  
  const tasks: Task[] = [];
  
  for (const line of lines) {
    let isTaskLine = taskIndicators.some(regex => regex.test(line));
    let taskText = line;
    
    // Skip very short lines unless they're clearly tasks
    if (!isTaskLine && line.length < 15) continue;
    
    // Clean up the task text (remove bullet points, numbering, etc.)
    taskIndicators.forEach(indicator => {
      taskText = taskText.replace(indicator, '');
    });
    
    // Convert conversational language to task-oriented language
    taskText = convertToTaskLanguage(taskText);
    
    // Extract task information
    const dueDate = extractDate(taskText);
    const priority = extractPriority(taskText);
    const assignee = extractAssignee(taskText);
    const status = extractStatus(taskText);
    const recurring = isRecurringTask(taskText);
    
    // Try to extract a project name specific to this task
    let projectName = extractProjectName(taskText) || overallProjectName;
    
    // Try to separate title from description if there's a colon or dash
    let title = taskText;
    let description = '';
    
    const titleSeparators = [/:\s/, /\s-\s/, /\s–\s/];
    for (const separator of titleSeparators) {
      const parts = taskText.split(separator, 2);
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
    
    // Highlight or extract deadline information from the text for display
    if (dueDate) {
      const formattedDate = new Date(dueDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      // Add deadline information to description if not already present
      if (!description.includes("Deadline") && !description.includes("Due date")) {
        description = description ? `${description}\nDeadline: ${formattedDate}` : `Deadline: ${formattedDate}`;
      }
    }
    
    // Remove the person's name from the title/description if it's already captured as assignee
    if (assignee) {
      const assigneePattern = new RegExp(`\\b${assignee}\\b`, 'gi');
      title = title.replace(assigneePattern, '').trim();
      description = description.replace(assigneePattern, '').trim();
      
      // Clean up the title if it starts with unnecessary words after name removal
      title = title.replace(/^(?:will|should|to|needs|is going to|has to)\s+/i, '');
      title = title.replace(/^(?:,|\.|\s)+/, ''); // Remove leading punctuation
      title = title.charAt(0).toUpperCase() + title.slice(1); // Capitalize first letter again
    }
    
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
      project: projectName
    });
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
