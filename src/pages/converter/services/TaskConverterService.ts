
import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { addTasksToIssueLogs } from '@/utils/issue-converter';
import { issueService } from '@/services/issueService';
import { IssueFormData } from '@/types/issue';

export const checkForIssueLogCommand = (text: string): boolean => {
  const issueLogCommands = [
    /add to issue log/i,
    /add to issues/i,
    /add to the issue log/i,
    /log as issues?/i,
    /create issues?/i,
    /add tasks? to issue log/i,
    /add to error log/i,
    /add them now/i,
    /add to log/i,
    /log now/i,
    /add all/i,
    /add tasks now/i,
    /convert to issue/i,
    /save as issue/i,
    /track as issue/i,
    /record issue/i
  ];
  
  return issueLogCommands.some(regex => regex.test(text));
};

export const extractTasksFromText = (text: string): Task[] => {
  if (!text || text.trim() === '') {
    return [];
  }
  
  console.log("Extracting tasks from text:", text.substring(0, 100) + "...");
  const tasks = parseTextIntoTasks(text);
  console.log("Extracted tasks:", tasks);
  
  return tasks;
};

export const addTasksToIssueLog = async (tasks: Task[]): Promise<{
  successful: number;
  failed: number;
  totalTasks: number;
}> => {
  if (tasks.length === 0) {
    return { successful: 0, failed: 0, totalTasks: 0 };
  }

  console.log("🚀 Starting to add tasks to issue log:", tasks);
  try {
    const result = await addTasksToIssueLogs(tasks);
    console.log("📊 Result from adding tasks to issue log:", result);
    
    return result;
  } catch (error) {
    console.error('❌ Error adding tasks to issue log:', error);
    return { successful: 0, failed: 0, totalTasks: tasks.length };
  }
};

export const addDirectTestIssue = async (): Promise<boolean> => {
  const testIssue: IssueFormData = {
    title: "Test Issue - Direct Addition",
    description: "This is a test issue added directly to verify the issue service is working.",
    status: 'open',
    priority: 'medium',
    created_by: 'Test User',
    assigned_to: 'Test User'
  };
  
  console.log("💡 Adding direct test issue:", testIssue);
  try {
    const result = await issueService.createIssue(testIssue);
    console.log("✅ Direct test issue result:", result);
    return true;
  } catch (error) {
    console.error("❌ Error adding direct test issue:", error);
    return false;
  }
};
