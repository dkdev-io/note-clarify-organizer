
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
}

// Function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Function to extract dates from text
const extractDate = (text: string): string | null => {
  // Look for common date patterns
  const dateRegex = /(?:by|due|on|for)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i;
  const match = text.match(dateRegex);
  
  if (match) {
    const month = match[1];
    const day = match[2];
    const year = match[3] || new Date().getFullYear().toString();
    
    const date = new Date(`${month} ${day}, ${year}`);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
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
    
    // Create a new task object
    const dueDate = extractDate(taskText);
    const priority = extractPriority(taskText);
    const assignee = extractAssignee(taskText);
    
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
    
    tasks.push({
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status: 'todo',
      assignee
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
