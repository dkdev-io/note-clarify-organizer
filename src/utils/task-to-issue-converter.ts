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

// Immediately add sample tasks to the issue log when this module is loaded
(async () => {
  console.log('🚀 Auto-adding historical tasks to issue log database...');
  
  const historicalTasks: Task[] = [
    {
      id: 'hist-task-1',
      title: 'Fix login page authentication',
      description: 'Users reported issues with login page not accepting valid credentials',
      priority: 'high',
      status: 'resolved',
      assignee: 'Sarah',
      project: 'User Authentication',
      workspace_id: null,
      isRecurring: false,
      frequency: null,
      projectId: null,
      duration: '2 days',
      timeEstimate: 240,
      dueDate: '2023-08-15'
    },
    {
      id: 'hist-task-2',
      title: 'Deploy new feature to production',
      description: 'The new dashboard analytics feature needs to be deployed to production servers',
      priority: 'medium',
      status: 'in-progress',
      assignee: 'John',
      project: 'Feature Deployment',
      workspace_id: null,
      isRecurring: false,
      frequency: null,
      projectId: null,
      duration: '1 day',
      timeEstimate: 120,
      dueDate: null
    },
    {
      id: 'hist-task-3',
      title: 'Update documentation for API v2',
      description: 'Update all documentation to reflect changes in API version 2.0',
      priority: 'low',
      status: 'open',
      assignee: 'Lisa',
      project: 'Documentation',
      workspace_id: null,
      isRecurring: false,
      frequency: null,
      projectId: null,
      duration: '3 days',
      timeEstimate: 360,
      dueDate: '2023-09-01'
    },
    {
      id: 'hist-task-4',
      title: 'Investigate server downtime',
      description: 'Server experienced unexpected downtime on May 15. Need to investigate logs and identify cause.',
      priority: 'critical',
      status: 'closed',
      assignee: 'Alex',
      project: 'Server Maintenance',
      workspace_id: null,
      isRecurring: false,
      frequency: null,
      projectId: null,
      duration: '4 hours',
      timeEstimate: 240,
      dueDate: '2023-05-16'
    },
    {
      id: 'hist-task-5',
      title: 'Implement password reset functionality',
      description: 'Add ability for users to reset their passwords through email',
      priority: 'medium',
      status: 'open',
      assignee: 'Carlos',
      project: 'User Management',
      workspace_id: null,
      isRecurring: false,
      frequency: null,
      projectId: null,
      duration: '2 days',
      timeEstimate: 240,
      dueDate: '2023-07-30'
    }
  ];
  
  try {
    const result = await addTasksToIssueLogs(historicalTasks);
    console.log('✅ Auto-addition result:', result);
  } catch (error) {
    console.error('❌ Error auto-adding historical tasks:', error);
  }
})();
