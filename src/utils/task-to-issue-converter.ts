
import { Task } from './task-parser/types';
import { IssueFormData, IssuePriority, IssueStatus } from '@/types/issue';
import { issueService } from '@/services/issueService';

/**
 * Maps task priority to issue priority
 */
const mapPriority = (taskPriority: string | null): IssuePriority => {
  if (!taskPriority) return 'medium';
  
  switch (taskPriority.toLowerCase()) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    case 'medium':
      return 'medium';
    case 'critical':
      return 'critical';
    default:
      return 'medium';
  }
};

/**
 * Maps task status to issue status
 */
const mapStatus = (taskStatus: string | null): IssueStatus => {
  if (!taskStatus) return 'open';
  
  switch (taskStatus.toLowerCase()) {
    case 'in_progress':
    case 'in progress':
      return 'in-progress';
    case 'completed':
    case 'done':
      return 'resolved';
    case 'closed':
      return 'closed';
    default:
      return 'open';
  }
};

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
    created_by: task.assignee || '',
    assigned_to: task.assignee || ''
  };
  
  console.log("Converted task to issue:", result);
  return result;
};

/**
 * Add a single task to the issue logs
 */
export const addTaskToIssueLog = async (task: Task): Promise<boolean> => {
  try {
    console.log('🔍 Converting task to issue:', JSON.stringify(task, null, 2));
    const issueData = taskToIssue(task);
    console.log('📋 Issue data to be saved:', JSON.stringify(issueData, null, 2));
    
    const result = await issueService.createIssue(issueData);
    console.log('✅ Result of creating issue:', result);
    
    if (!result) {
      console.error('❌ Issue creation returned null result');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error adding task to issue log:', error);
    return false;
  }
};

/**
 * Add multiple tasks to the issue logs
 * @returns Object containing successful and failed tasks
 */
export const addTasksToIssueLogs = async (tasks: Task[]): Promise<{
  successful: number;
  failed: number;
  totalTasks: number;
}> => {
  let successful = 0;
  let failed = 0;
  
  console.log(`🚀 Starting to add ${tasks.length} tasks to issue logs`);
  
  if (tasks.length === 0) {
    console.warn('⚠️ No tasks provided to add to issue logs');
    return { successful: 0, failed: 0, totalTasks: 0 };
  }
  
  for (const task of tasks) {
    try {
      console.log(`📝 Processing task: ${task.title}`);
      const success = await addTaskToIssueLog(task);
      if (success) {
        console.log(`✅ Successfully added task: ${task.title}`);
        successful++;
      } else {
        console.log(`❌ Failed to add task: ${task.title}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ Error adding task to issue logs: ${error}`);
      failed++;
    }
  }
  
  console.log(`🏁 Completed adding tasks to issue logs: ${successful} successful, ${failed} failed`);
  
  return {
    successful,
    failed,
    totalTasks: tasks.length
  };
};
