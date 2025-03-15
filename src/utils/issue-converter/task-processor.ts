
import { Task } from '../task-parser/types';
import { taskToIssue } from './task-converter';
import { issueService } from '@/services/issueService';

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
