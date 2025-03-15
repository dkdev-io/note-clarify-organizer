
import { Task } from '../task-parser/types';
import { IssueFormData } from '@/types/issue';
import { mapPriority } from './priority-mapper';
import { mapStatus } from './status-mapper';

/**
 * Converts a task to an issue format
 */
export const taskToIssue = (task: Task): IssueFormData => {
  console.log('Converting task to issue format:', JSON.stringify(task, null, 2));
  
  // Build description to include task metadata
  let description = task.description || '';
  
  // Add assignee if available
  if (task.assignee) {
    description += `\n\nAssignee: ${task.assignee}`;
  }
  
  // Add project info if available
  if (task.project) {
    description += `\n\nProject: ${task.project}`;
  }
  
  // Add due date if available
  if (task.dueDate) {
    description += `\n\nDue Date: ${task.dueDate}`;
  }
  
  // Add time estimate if available
  if (task.timeEstimate) {
    description += `\n\nTime Estimate: ${task.timeEstimate} minutes`;
  }
  
  // Add duration if available
  if (task.duration) {
    description += `\n\nDuration: ${task.duration}`;
  }
  
  const result: IssueFormData = {
    title: task.title,
    description: description.trim(),
    status: mapStatus(task.status),
    priority: mapPriority(task.priority),
    created_by: task.assignee || 'System',
    assigned_to: task.assignee || ''
  };
  
  console.log("Converted task to issue:", JSON.stringify(result, null, 2));
  return result;
};
