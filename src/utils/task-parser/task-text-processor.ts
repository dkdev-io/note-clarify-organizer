/**
 * Functions to process and cleanup task text
 */

import { extractAssignee } from './metadata-extractor';
import { shouldKeepAsSingleTask } from './text-preprocessor';

// Improved function to split text into sub-tasks if needed
export const splitIntoSubtasks = (text: string): string[] => {
  console.log('🔍 splitIntoSubtasks input:', text);
  const tasks: string[] = [];
  
  // Fix for the Danny/Jennifer pattern that was causing issues
  const jennyDannyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?).+?finished,\s+(?:she|he|they)(?:'ll|\s+will)?\s+send\s+(?:to|it\s+to)?\s+([A-Z][a-z]+)/i;
  const jennyMatch = text.match(jennyDannyPattern);
  
  if (jennyMatch) {
    // Handle this specific case separately to avoid the parsing issues
    return [text]; // Keep it as one task for now to avoid the splitting issues
  }
  
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
  
  // Check if this text should be kept as a single task
  if (shouldKeepAsSingleTask(text)) {
    return [text];
  }
  
  // Look for sequences - splitting by various patterns
  const potentialTasks: string[] = [];
  
  // Split by period only if it makes sense
  const sequencesByPeriod = text.split(/\.\s+/).filter(s => s.trim().length > 0);
  if (sequencesByPeriod.length > 1) {
    // Check if splitting by period actually creates valid separate tasks
    const allLookLikeTasks = sequencesByPeriod.every(s => 
      s.length > 10 && // Not too short
      /\b(?:will|should|must|need|needs|has to|have to|going to|finish|complete|deliver|send|meet)\b/i.test(s) // Contains action words
    );
    
    if (allLookLikeTasks) {
      potentialTasks.push(...sequencesByPeriod);
    }
  }
  
  // Look for "and then" or similar sequence indicators
  const sequencesByConnectors = text.split(/\s+and\s+then\s+|\s+after\s+that\s+|\s+next,?\s+|\s+subsequently\s+|\s+following\s+that\s+/i)
    .filter(s => s.trim().length > 0);
  if (sequencesByConnectors.length > 1) {
    potentialTasks.push(...sequencesByConnectors);
  }
  
  // Look for numbered sequences like "1. First task 2. Second task"
  const sequencesByNumbers = text.split(/\s*\d+\.\s+/).filter(s => s.trim().length > 0);
  if (sequencesByNumbers.length > 1) {
    potentialTasks.push(...sequencesByNumbers);
  }
  
  // Look for "before" clauses which often indicate two separate tasks
  const sequencesByBefore = text.split(/\s+before\s+/i).filter(s => s.trim().length > 0);
  if (sequencesByBefore.length > 1) {
    potentialTasks.push(...sequencesByBefore);
  }
  
  // Track already seen tasks to avoid duplicates - NEW DEDUPLICATION MECHANISM
  const seenTaskTexts = new Set<string>();
  const uniqueTasks: string[] = [];
  
  // For each potential task, check if it appears to be a valid task (has a verb, reasonable length)
  for (const potential of potentialTasks) {
    const normalized = potential.trim().toLowerCase();
    
    // Skip if we've already seen this task (case-insensitive)
    if (seenTaskTexts.has(normalized)) {
      continue;
    }
    
    // Skip if it's too short or doesn't have an action verb
    if (potential.trim().length < 10 || !(/\b(?:do|make|create|update|review|finish|complete|check|send|write|prepare|schedule|organize|develop|design|implement|test|fix|build|draft|edit|add|remove|change|modify|analyze|evaluate|assess|report|present|discuss|meet|call|email|post|share|upload|download|generate|produce|deliver|submit|approve|verify|check|complete|finish|send|write)\b/i.test(potential))) {
      continue;
    }
    
    // Mark this task as seen (case-insensitive)
    seenTaskTexts.add(normalized);
    uniqueTasks.push(potential.trim());
  }
  
  // If we found more than one unique task, return them as separate tasks
  if (uniqueTasks.length > 1) {
    return uniqueTasks;
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
  console.log('🔍 splitIntoSubtasks output:', [text]);
  return [text];
};

// Function to preserve user input exactly as typed - no cleaning
export const cleanupTaskTitle = (
  title: string, 
  assignee: string | null, 
  dueDate: string | null, 
  duration: string | null = null
): string => {
  // Return the user's input exactly as they typed it
  // Only clean up excessive whitespace
  return title.replace(/\s{2,}/g, ' ').trim();
};
