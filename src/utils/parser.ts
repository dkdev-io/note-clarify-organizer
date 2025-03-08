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
}

// Function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Function to extract dates from text
const extractDate = (text: string): string | null => {
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
    
    // Format: Relative dates (tomorrow, next week, in 3 days)
    /\b(?:tomorrow|today|next week|in\s+(\d+)\s+days?)\b/i
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
            yearStr = match[3] || new Date().getFullYear().toString();
          } else {
            // Direct month name format
            monthStr = match[1];
            dayStr = match[2];
            yearStr = match[3] || new Date().getFullYear().toString();
          }
          
          const date = new Date(`${monthStr} ${dayStr}, ${yearStr}`);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        // Relative dates
        else if (/(?:this|next|tomorrow|today|in)/i.test(match[0])) {
          const today = new Date();
          let resultDate = new Date(today);
          
          if (/tomorrow/i.test(match[0])) {
            resultDate.setDate(today.getDate() + 1);
          } else if (/next week/i.test(match[0])) {
            resultDate.setDate(today.getDate() + 7);
          } else if (/in\s+(\d+)\s+days?/i.test(match[0])) {
            const daysMatch = match[0].match(/in\s+(\d+)\s+days?/i);
            if (daysMatch && daysMatch[1]) {
              const days = parseInt(daysMatch[1], 10);
              resultDate.setDate(today.getDate() + days);
            }
          } else if (/this|next/i.test(match[0]) && /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(match[0])) {
            const dayOfWeekMatch = match[0].match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dayOfWeekMatch) {
              const dayOfWeek = dayOfWeekMatch[1].toLowerCase();
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const targetDay = daysOfWeek.indexOf(dayOfWeek);
              
              let daysToAdd = (targetDay - today.getDay() + 7) % 7;
              if (/next/i.test(match[0])) {
                daysToAdd += 7;
              }
              if (daysToAdd === 0) {
                daysToAdd = 7; // If "this Sunday" and today is Sunday, go to next Sunday
              }
              
              resultDate.setDate(today.getDate() + daysToAdd);
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

// Function to extract assignee from text
const extractAssignee = (text: string): string | null => {
  const assigneeRegex = /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+)(?:,|\.|$)/i;
  const match = text.match(assigneeRegex);
  
  return match ? match[1].trim() : null;
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

// Main function to parse text into potential tasks
export const parseTextIntoTasks = (text: string): Task[] => {
  if (!text.trim()) return [];
  
  // Split text into lines
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  
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
    
    // Extract task information
    const dueDate = extractDate(taskText);
    const priority = extractPriority(taskText);
    const assignee = extractAssignee(taskText);
    const status = extractStatus(taskText);
    const recurring = isRecurringTask(taskText);
    
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
      frequency: recurring.frequency
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
