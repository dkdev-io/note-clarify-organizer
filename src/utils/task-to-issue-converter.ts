
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
 * Add a single task to the issue log
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

// Generate proper UUIDs for our predefined issues
const LLM_ISSUE_UUID = "11111111-1111-1111-1111-111111111111";
const PROJECT_ISSUE_UUID = "22222222-2222-2222-2222-222222222222";
const TIME_ISSUE_UUID = "33333333-3333-3333-3333-333333333333";

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
      title: "LLM not connecting",
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
      created_by: "Dan"
    };
    
    console.log('Creating LLM Connection Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(LLM_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create LLM Connection Issue report:', error);
    return false;
  }
};

/**
 * Add a report about project assignment issues
 */
export const addProjectAssignmentIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "Task Project Assignment Issues",
      description: `
Summary of Project Assignment Issues:

The application is experiencing problems with tasks not being assigned to the correct project. 
When users create tasks and select a specific project, the tasks sometimes end up unassigned 
or associated with a different project than intended.

Issues observed:
1. Project name is correctly extracted but not passed to the Motion API
2. Selected project in dropdown doesn't always propagate to created tasks
3. Inconsistency between project name and projectId in task objects

Root causes identified:
- The project name is extracted from text but not properly linked to a projectId
- When passing data between components, project information is sometimes lost
- The TasksReview component doesn't consistently maintain project association
- projectId and project name synchronization issues in the API service

Attempted solutions:
- Updated TasksReview component to pass the correct project name
- Modified the task converter logic to preserve project information
- Improved logging to track project assignment through the process flow
- Added project name normalization to ensure consistency

Next steps:
- Implement better state management for project selection
- Ensure project name and ID are always passed together throughout the application
- Add validation to confirm project assignment before task creation
- Update the Motion API integration to properly handle project assignments

This issue requires a comprehensive review of the project assignment flow from selection 
to final task creation to ensure consistency throughout the pipeline.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "Dan"
    };
    
    console.log('Creating Project Assignment Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(PROJECT_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create Project Assignment Issue report:', error);
    return false;
  }
};

/**
 * Add a report about time estimation issues
 */
export const addTimeEstimationIssueReport = async (): Promise<boolean> => {
  try {
    // Current date and time
    const now = new Date();
    const formattedDate = now.toISOString();
    
    // Create the issue data
    const issueData: IssueFormData = {
      title: "Time Estimation Parsing & Duration Field Issues",
      description: `
Summary of Time Estimation Issues:

The application is experiencing issues with time estimates not being correctly parsed from
task descriptions and not being properly added to the duration field in Motion API requests.

Issues observed:
1. Time estimates mentioned in natural language (e.g., "this will take 2 hours") are not consistently extracted
2. Extracted time values are not being properly converted to minute values required by Motion
3. The duration field is sometimes populated but not properly passed to the Motion API
4. Time estimates from the completion screen are not consistently applied to all tasks

Root causes identified:
- The duration-extractor.ts regex patterns don't capture all common time expressions
- Extracted duration strings aren't converted to numeric minute values for the timeEstimate field
- The Motion API integration is using timeEstimate but may not be properly formatting it
- Inconsistency between "duration" (text description) and "timeEstimate" (minutes) fields

Attempted solutions:
- Added basic regex patterns for duration extraction from text
- Implemented timeEstimate field in the task object
- Added UI field in CompletionScreen for time estimates
- Modified task-review-service.ts to include time estimates in API calls
- Added time estimate parameter passing in the Motion tasks API wrapper

Next steps:
- Enhance duration extractor with more comprehensive patterns
- Add a numeric parser for duration strings to convert to minutes
- Ensure consistent field usage between duration (text) and timeEstimate (minutes)
- Add validation to confirm time estimates are properly formatted before API calls
- Add explicit logging of time estimate values at each processing stage
- Fix the Motion API integration to ensure timeEstimate is properly included in requests

This issue requires improvements to both the parsing logic and the API integration to ensure
time estimates are consistently captured and applied to tasks.

Date reported: ${now.toLocaleString()}
      `.trim(),
      status: "open",
      priority: "high",
      created_by: "Dan"
    };
    
    console.log('Creating Time Estimation Issue report with specific UUID');
    
    // Use a proper UUID format
    const result = await issueService.createIssueWithId(TIME_ISSUE_UUID, issueData);
    
    return !!result;
  } catch (error) {
    console.error('Failed to create Time Estimation Issue report:', error);
    return false;
  }
};
