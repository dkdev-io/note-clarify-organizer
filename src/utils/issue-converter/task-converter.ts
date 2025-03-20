
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
  
  // Add folder info if available
  if (task.folder) {
    description += `\n\nFolder: ${task.folder}`;
  }
  
  // Add start date if available
  if (task.startDate) {
    description += `\n\nStart Date: ${task.startDate}`;
  }
  
  // Add due date if available
  if (task.dueDate) {
    description += `\n\nDue Date: ${task.dueDate}`;
    
    if (task.hardDeadline) {
      description += " (Hard deadline)";
    }
  }
  
  // Add auto-scheduling info
  description += `\n\nAuto-scheduled: ${task.autoScheduled ? 'Yes' : 'No'}`;
  
  // Add pending status
  if (task.isPending) {
    description += `\n\nPending: Yes`;
  }
  
  // Add schedule preference
  if (task.schedule) {
    description += `\n\nSchedule: ${task.schedule}`;
  }
  
  // Add time estimate if available
  if (task.timeEstimate) {
    description += `\n\nTime Estimate: ${task.timeEstimate} minutes`;
  }
  
  // Add duration if available
  if (task.duration) {
    description += `\n\nDuration: ${task.duration}`;
  }
  
  // Add labels if available
  if (task.labels && task.labels.length > 0) {
    description += `\n\nLabels: ${task.labels.join(', ')}`;
  }
  
  // Add custom fields if available
  if (task.customFields) {
    description += `\n\nCustom Fields: ${JSON.stringify(task.customFields)}`;
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
