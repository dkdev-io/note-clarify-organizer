
import { Task } from '@/utils/task-parser/types';

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

type MessageType = {
  type: 'system' | 'ai' | 'user';
  content: string;
};

type Suggestion = {
  id: string;
  taskId: string;
  field: keyof Task;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  applied: boolean;
};

// Main function to generate suggestions based on task analysis
export const generateSuggestions = async (tasks: Task[]): Promise<{
  suggestions: Suggestion[],
  updatedMessages: MessageType[]
}> => {
  // In a real application, this would call an LLM API
  // For now, we'll use predefined rules to generate suggestions
  
  const messages: MessageType[] = [];
  const suggestions: Suggestion[] = [];
  
  // Add initial message from AI
  messages.push({
    type: 'ai',
    content: `I've analyzed your ${tasks.length} tasks and found a few suggestions to improve them before sending to Motion.`
  });
  
  // Check each task and generate suggestions
  tasks.forEach(task => {
    // Check for missing priority
    if (!task.priority) {
      const suggestedPriority = guessPriority(task);
      suggestions.push({
        id: generateId(),
        taskId: task.id,
        field: 'priority',
        currentValue: null,
        suggestedValue: suggestedPriority,
        reason: `Add ${suggestedPriority} priority to "${task.title}"`,
        applied: false
      });
    }
    
    // Check for missing due date
    if (!task.dueDate) {
      const suggestedDueDate = suggestDueDate();
      suggestions.push({
        id: generateId(),
        taskId: task.id,
        field: 'dueDate',
        currentValue: null,
        suggestedValue: suggestedDueDate,
        reason: `Add a due date to "${task.title}"`,
        applied: false
      });
    }
    
    // Check for urgent/critical tasks that should be hard deadlines
    if (task.priority === 'high' && task.dueDate && !task.hardDeadline) {
      if (task.title.toLowerCase().includes('urgent') || 
          task.title.toLowerCase().includes('critical') ||
          task.description?.toLowerCase().includes('urgent') ||
          task.description?.toLowerCase().includes('critical')) {
        suggestions.push({
          id: generateId(),
          taskId: task.id,
          field: 'hardDeadline',
          currentValue: false,
          suggestedValue: true,
          reason: `Mark "${task.title}" as a hard deadline since it appears urgent`,
          applied: false
        });
      }
    }
    
    // Suggest time estimates for tasks without them
    if (!task.timeEstimate) {
      const suggestedTimeEstimate = estimateTaskTime(task);
      suggestions.push({
        id: generateId(),
        taskId: task.id,
        field: 'timeEstimate',
        currentValue: null,
        suggestedValue: suggestedTimeEstimate,
        reason: `Add a time estimate of ${suggestedTimeEstimate} minutes to "${task.title}"`,
        applied: false
      });
    }
    
    // Suggest labels based on task content
    if (!task.labels || task.labels.length === 0) {
      const suggestedLabels = generateLabels(task);
      if (suggestedLabels.length > 0) {
        suggestions.push({
          id: generateId(),
          taskId: task.id,
          field: 'labels',
          currentValue: [],
          suggestedValue: suggestedLabels,
          reason: `Add labels to categorize "${task.title}"`,
          applied: false
        });
      }
    }
  });
  
  // Add summary message
  if (suggestions.length > 0) {
    messages.push({
      type: 'ai',
      content: `I found ${suggestions.length} potential improvements. Would you like me to apply any of these suggestions?`
    });
  } else {
    messages.push({
      type: 'ai',
      content: "Your tasks look good! I don't have any suggestions for improvement."
    });
  }
  
  return { suggestions, updatedMessages: messages };
};

// Helper functions for generating suggestions
const guessPriority = (task: Task): 'low' | 'medium' | 'high' => {
  const title = task.title.toLowerCase();
  const description = task.description?.toLowerCase() || '';
  
  // Check for urgent terms
  if (title.includes('urgent') || 
      title.includes('asap') || 
      title.includes('critical') ||
      description.includes('urgent') || 
      description.includes('asap') || 
      description.includes('critical')) {
    return 'high';
  }
  
  // Check for important terms
  if (title.includes('important') || 
      description.includes('important')) {
    return 'medium';
  }
  
  // Default to low priority
  return 'low';
};

const suggestDueDate = (): string => {
  // Generate a due date within the next week
  const today = new Date();
  const daysToAdd = Math.floor(Math.random() * 7) + 1;
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  
  return dueDate.toISOString().split('T')[0];
};

const estimateTaskTime = (task: Task): number => {
  const title = task.title.toLowerCase();
  const description = task.description?.toLowerCase() || '';
  const content = `${title} ${description}`;
  
  // Base estimate on content length and complexity
  let baseEstimate = 30; // Default to 30 minutes
  
  // Adjust based on keywords
  if (content.includes('quick') || content.includes('simple') || content.includes('easy')) {
    baseEstimate = 15;
  } else if (content.includes('complex') || content.includes('difficult') || content.includes('research')) {
    baseEstimate = 60;
  }
  
  // Add some randomness
  const randomFactor = Math.floor(Math.random() * 15);
  return baseEstimate + randomFactor;
};

const generateLabels = (task: Task): string[] => {
  const labels: string[] = [];
  const title = task.title.toLowerCase();
  const description = task.description?.toLowerCase() || '';
  const content = `${title} ${description}`;
  
  // Add labels based on content keywords
  if (content.includes('bug') || content.includes('fix') || content.includes('issue')) {
    labels.push('bug');
  }
  
  if (content.includes('feature') || content.includes('implement') || content.includes('add')) {
    labels.push('feature');
  }
  
  if (content.includes('documentation') || content.includes('docs') || content.includes('readme')) {
    labels.push('documentation');
  }
  
  if (content.includes('meeting') || content.includes('call') || content.includes('discuss')) {
    labels.push('meeting');
  }
  
  if (content.includes('email') || content.includes('message') || content.includes('contact')) {
    labels.push('communication');
  }
  
  // Only return unique labels
  return [...new Set(labels)];
};
