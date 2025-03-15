
import { Task } from './task-parser/types';
import { IssueFormData, IssuePriority, IssueStatus } from '@/types/issue';
import { issueService } from '@/services/issueService';

/**
 * Maps task priority to issue priority
 */
const mapPriority = (taskPriority: string | null): IssuePriority => {
  if (!taskPriority) return 'medium';
  
  const priority = taskPriority.toLowerCase();
  console.log(`Mapping priority: ${taskPriority} -> normalized: ${priority}`);
  
  if (priority.includes('high') || priority.includes('urgent') || priority.includes('important')) {
    return 'high';
  } else if (priority.includes('low')) {
    return 'low';
  } else if (priority.includes('critical')) {
    return 'critical';
  } else {
    return 'medium';
  }
};

/**
 * Maps task status to issue status
 */
const mapStatus = (taskStatus: string | null): IssueStatus => {
  if (!taskStatus) return 'open';
  
  const status = taskStatus.toLowerCase();
  console.log(`Mapping status: ${taskStatus} -> normalized: ${status}`);
  
  if (status.includes('progress') || status.includes('working') || status.includes('started')) {
    return 'in-progress';
  } else if (status.includes('complete') || status.includes('done') || status.includes('resolved') || status.includes('finished')) {
    return 'resolved';
  } else if (status.includes('close') || status.includes('cancel') || status.includes('abandon')) {
    return 'closed';
  } else {
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
    created_by: task.assignee || 'System',
    assigned_to: task.assignee || ''
  };
  
  console.log("Converted task to issue:", JSON.stringify(result, null, 2));
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
    
    // Validate the issue data before saving
    if (!issueData.title) {
      console.error('❌ Task has no title, cannot create issue');
      return false;
    }
    
    const result = await issueService.createIssue(issueData);
    console.log('✅ Result of creating issue:', result);
    
    if (!result) {
      console.error('❌ Issue creation returned null result');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error adding task to issue log:', error);
    console.error('Error details:', error);
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

/**
 * Add a report about LLM connection issues
 */
export const addLLMConnectionIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "LLM Connection Issues Investigation",
      description: `
Summary of LLM Connection Issues:

The application is experiencing intermittent connectivity issues with the Language Model (LLM) service. 
When attempting to process tasks with the LLM, the connection occasionally fails, leading to fallback 
to local processing.

Issues observed:
1. Timeouts when connecting to the Supabase edge function (process-task-batch)
2. Occasional failures in processing responses from the LLM
3. Fallback mechanism engaging more frequently than expected

Attempted solutions:
- Implemented local task enhancement as a fallback mechanism
- Added detailed logging throughout the LLM processing flow
- Monitored edge function response times and error patterns

Next steps:
- Review Supabase function logs for specific error patterns
- Test with alternative timeout settings
- Implement more robust error handling in the LLM processor

This issue requires further investigation to determine if the problem is with the 
Supabase edge function configuration, the OpenAI API connection, or client-side handling.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "System Diagnostics"
    };
    
    console.log('Creating LLM Connection Issue report with specific ID');
    
    // Use the ID "1" as requested
    const result = await issueService.createIssueWithId("1", issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create LLM Connection Issue report:', error);
    return false;
  }
};
