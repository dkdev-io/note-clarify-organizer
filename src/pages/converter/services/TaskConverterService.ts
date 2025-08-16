
import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { addTasksToIssueLogs } from '@/utils/issue-converter';
import { issueService } from '@/services/issueService';
import { IssueFormData } from '@/types/issue';
import { supabase } from '@/integrations/supabase/client';

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

export const extractTasksFromText = async (text: string): Promise<Task[]> => {
  if (!text || text.trim() === '') {
    console.log("Empty text provided for task extraction");
    return [];
  }
  
  console.log("=== TASK EXTRACTION DEBUG ===");
  console.log("Full input text:", text);
  console.log("Text length:", text.length);
  console.log("Text trim length:", text.trim().length);
  
  try {
    const tasks = parseTextIntoTasks(text);
    console.log("parseTextIntoTasks returned:", tasks);
    console.log("Number of tasks extracted:", tasks.length);
    
    if (tasks.length === 0) {
      console.log("No tasks found - checking input text format");
      const lines = text.split(/\r?\n/);
      console.log("Lines in text:", lines);
      lines.forEach((line, index) => {
        console.log(`Line ${index}:`, JSON.stringify(line));
      });
    }
    
    return tasks;
  } catch (error) {
    console.error("Error in parseTextIntoTasks:", error);
    throw error;
  }
};

// Simple function that just returns the original tasks - no LLM enhancement for now
export const getTasksWithRecommendations = async (tasks: Task[]): Promise<Task[]> => {
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
