
/**
 * Main task parser module that brings together all the parsing utilities
 */

import { Task } from './types';
import { generateId, convertToTaskLanguage, filterMeetingChatter, isIntroductionText } from './utils';
import { extractDate } from './date-parser';
import { extractPriority, extractAssignee, extractStatus, isRecurringTask, extractProjectName } from './metadata-extractor';
import { splitIntoSubtasks, cleanupTaskTitle } from './task-text-processor';
import { validateTask, validateTasks } from './task-validator';
import { refineTask } from './task-editor';

// Main function to parse text into potential tasks
export const parseTextIntoTasks = (text: string, defaultProjectName: string | null = null): Task[] => {
  if (!text.trim()) return [];
  
  // Extract a project name first from the overall text or use the provided default
  const extractedProjectName = extractProjectName(text);
  
  // Use the extracted project name or default to "Tasks"
  const projectName = defaultProjectName || extractedProjectName || "Tasks";
  console.log("Using project name:", projectName);
  
  // Split text into lines and filter out meeting chatter
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
  // Track seen tasks to avoid duplicates - this is the important new addition
  const seenTaskTitles = new Set<string>();
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
      
      // Skip duplicate tasks by checking the title
      const normalizedTitle = title.trim().toLowerCase();
      if (seenTaskTitles.has(normalizedTitle)) {
        console.log("Skipping duplicate task:", title);
        continue;
      }
      
      // Add to seen titles set to prevent duplicates
      seenTaskTitles.add(normalizedTitle);
      
      // Add a task with the project name explicitly set, but with a clean description that doesn't duplicate metadata
      tasks.push({
        id: generateId(),
        title: title.trim(),
        description: description.trim(), // Just the actual description without metadata
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

// Re-export all the utility functions and types for use in other modules
export { 
  Task,
  validateTask, 
  validateTasks,
  refineTask,
  extractDate,
  extractPriority,
  extractAssignee,
  extractStatus,
  isRecurringTask,
  extractProjectName,
  cleanupTaskTitle,
  splitIntoSubtasks
};
