
/**
 * Main task parser module that brings together all the parsing utilities
 */

import { Task } from './types';
import { generateId, convertToTaskLanguage, filterMeetingChatter, isIntroductionText } from './utils';
import { extractDate } from './date-parser';
import { extractPriority, extractAssignee, extractStatus, isRecurringTask, extractProjectName, extractDuration } from './metadata-extractor';
import { getCurrentUserName } from '../motion/current-user';
import { splitIntoSubtasks, cleanupTaskTitle } from './task-text-processor';
import { preprocessTaskText } from './text-preprocessor';
import { validateTask, validateTasks } from './task-validator';
import { refineTask } from './task-editor';
import { tasksToCSV, downloadTasksAsCSV } from './export';

// Main function to parse text into potential tasks
export const parseTextIntoTasks = async (text: string, defaultProjectName: string | null = null, apiKey?: string): Promise<Task[]> => {
  if (!text.trim()) return [];
  
  // Enhanced logging for debugging
  console.log("Starting text parsing with:", text.substring(0, 100) + "...");
  
  // Get current user name for default assignment
  const currentUserName = await getCurrentUserName(apiKey);
  console.log("Current user name for assignment:", currentUserName);
  
  // Extract a project name first from the overall text or use the provided default
  const extractedProjectName = extractProjectName(text);
  
  // Use the extracted project name or default to "Tasks"
  const projectName = defaultProjectName || extractedProjectName || "Tasks";
  console.log("Using project name:", projectName);
  
  // Preprocess text to join lines that belong together
  const preprocessedText = preprocessTaskText(text);
  console.log("Preprocessed text:", preprocessedText.substring(0, 200) + "...");
  
  // Split text into lines and filter out meeting chatter
  const lines = preprocessedText.split(/\r?\n/).filter(filterMeetingChatter);
  
  // Identify potential tasks by looking for action items, bullet points, numbered lists, etc.
  const taskIndicators = [
    /^\s*[\-\*•]\s+/,                                  // Bullet points
    /^\s*\d+\.\s+/,                                    // Numbered lists
    /\b(?:todo|to-do|action item|task)s?\b:?\s*/i,    // Explicit task indicators
    /\b(?:need|needs) to\b/i,                         // Need to statements
    /\b(?:should|must|will have to|going to)\b/i,     // Obligation indicators
    /\b(?:will|shall)\s+\w+/i,                        // Future actions like "will do", "will finish"
    /\bby\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}|\w+day)/i, // Deadline indicators
    /\w+\s+will\s+/i                                   // Pattern like "Dan will"
  ];
  
  const tasks: Task[] = [];
  // Track seen tasks to avoid duplicates - this is the important new addition
  const seenTaskTitles = new Set<string>();
  let isFirstLine = true;
  
  for (const line of lines) {
    let isTaskLine = taskIndicators.some((regex, index) => {
      const matches = regex.test(line);
      if (matches) {
        console.log(`Line "${line}" matched indicator ${index}: ${regex}`);
      }
      return matches;
    });
    let taskText = line;
    
    console.log(`Processing line: "${line}"`);
    console.log(`Is task line: ${isTaskLine}`);
    
    // Skip very short lines unless they're clearly tasks
    if (!isTaskLine && line.length < 10) {
      console.log("Skipping short line");
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
    
    // Clean up the task text (remove ONLY formatting like bullets, numbering, etc.)
    // Don't remove semantic content like "will", "need to", etc.
    console.log('🔍 BEFORE formatting removal:', taskText);
    const formattingIndicators = [
      /^\s*[\-\*•]\s+/,     // Bullet points
      /^\s*\d+\.\s+/,       // Numbered lists
    ];
    
    formattingIndicators.forEach((indicator, i) => {
      const before = taskText;
      taskText = taskText.replace(indicator, '');
      if (before !== taskText) {
        console.log(`🔍 Formatting indicator ${i} changed text from '${before}' to '${taskText}'`);
      }
    });
    
    console.log('🔍 AFTER formatting removal:', taskText);
    
    // Split into subtasks if needed
    const subtasks = splitIntoSubtasks(taskText);
    
    for (const subtaskText of subtasks) {
      // Enhanced logging for debugging
      console.log("Processing subtask:", subtaskText);
      
      // Extract task information first to properly identify assignees, dates, etc.
      const dueDate = extractDate(subtaskText);
      const priority = extractPriority(subtaskText);
      const assignee = extractAssignee(subtaskText, currentUserName);
      console.log("Extracted assignee:", assignee);
      const status = extractStatus(subtaskText);
      const recurring = isRecurringTask(subtaskText);
      const duration = extractDuration(subtaskText); // Extract duration information
      
      // Clean up the task title - remove names, dates, priority, etc.
      console.log('🔍 BEFORE cleanupTaskTitle:', subtaskText);
      let processedTitle = cleanupTaskTitle(subtaskText, assignee, dueDate, duration);
      console.log('🔍 AFTER cleanupTaskTitle:', processedTitle);
      
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
      
      // Add duration information to the description if available
      if (duration && !description.includes(duration)) {
        description = description ? `${description} Duration: ${duration}.` : `Duration: ${duration}.`;
      }
      
      // Create the task object with ALL required fields including new Motion fields
      tasks.push({
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        startDate: null,             // Initialize new field for Motion's start date
        hardDeadline: false,         // Initialize new field for Motion's hard deadline
        priority,
        status,
        assignee,
        workspace_id: null,
        isRecurring: recurring.isRecurring,
        frequency: recurring.frequency,
        project: projectName,
        projectId: null,
        duration: duration,
        timeEstimate: null,
        folder: null,                // Initialize new field for Motion's folder
        autoScheduled: true,         // Default to auto-scheduled
        isPending: false,            // Default to not pending
        schedule: "Work hours",      // Default schedule
        labels: null,                // Initialize labels as null
        customFields: null           // Initialize custom fields as null
      });
    }
  }
  
  // Enhanced logging for debugging
  console.log(`Extracted ${tasks.length} tasks. First task:`, tasks.length > 0 ? tasks[0] : 'None');
  
  return tasks;
};

// Re-export the type using 'export type' syntax to fix TS1205 error
export type { Task };

// Re-export all the utility functions for use in other modules
export { 
  validateTask, 
  validateTasks,
  refineTask,
  extractDate,
  extractPriority,
  extractAssignee,
  extractStatus,
  isRecurringTask,
  extractProjectName,
  extractDuration,
  cleanupTaskTitle,
  splitIntoSubtasks,
  tasksToCSV,
  downloadTasksAsCSV
};
