
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
    return [];
  }
  
  console.log("Extracting tasks from text:", text.substring(0, 100) + "...");
  const tasks = parseTextIntoTasks(text);
  console.log("Extracted tasks:", tasks);
  
  // Store tasks in Supabase for persistence and later LLM review
  if (tasks.length > 0) {
    try {
      // Convert tasks to the format for Supabase
      const tasksForDb = tasks.map(task => ({
        title: task.title,
        description: task.description || null,
        due_date: task.dueDate ? new Date(task.dueDate) : null,
        start_date: task.startDate ? new Date(task.startDate) : null,
        hard_deadline: task.hardDeadline || false,
        priority: task.priority || null,
        status: task.status || 'todo',
        assignee: task.assignee || null,
        workspace_id: task.workspace_id || null,
        is_recurring: task.isRecurring || false,
        frequency: task.frequency || null,
        project: task.project || null,
        project_id: task.projectId || null,
        duration: task.duration || null,
        time_estimate: task.timeEstimate || null,
        folder: task.folder || null,
        auto_scheduled: task.autoScheduled || true,
        is_pending: task.isPending || false,
        schedule: task.schedule || null,
        labels: task.labels || null,
        custom_fields: task.customFields || null
      }));

      console.log("Saving tasks to Supabase:", tasksForDb);
      const { data, error } = await supabase
        .from('extracted_tasks')
        .insert(tasksForDb)
        .select();
      
      if (error) {
        console.error("Error saving tasks to Supabase:", error);
      } else {
        console.log("Tasks saved to Supabase successfully:", data);
      }
    } catch (error) {
      console.error("Error preparing tasks for Supabase:", error);
    }
  }
  
  return tasks;
};

// Add a new function to get tasks with LLM recommendations
export const getTasksWithRecommendations = async (tasks: Task[]): Promise<Task[]> => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  try {
    // Get the most recently saved tasks from Supabase
    const { data: savedTasks, error } = await supabase
      .from('extracted_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(tasks.length);
    
    if (error) {
      console.error("Error fetching saved tasks from Supabase:", error);
      return tasks; // Return original tasks if there's an error
    }

    if (!savedTasks || savedTasks.length === 0) {
      console.log("No saved tasks found in Supabase");
      return tasks; // Return original tasks if no saved tasks found
    }

    console.log("Retrieved saved tasks from Supabase:", savedTasks);
    
    // Map Supabase tasks back to our Task type format
    // This is where we'd implement LLM recommendations in a real implementation
    // For now, we'll just use the saved tasks as a passthrough
    const enhancedTasks = tasks.map(task => {
      // Find the corresponding saved task
      const savedTask = savedTasks.find(st => st.title === task.title);
      
      if (savedTask) {
        // Add any fields from Supabase that might be enhanced
        return {
          ...task,
          // Convert any fields that need type conversion
          dueDate: savedTask.due_date || task.dueDate,
          startDate: savedTask.start_date || task.startDate,
          hardDeadline: savedTask.hard_deadline || task.hardDeadline,
          priority: savedTask.priority || task.priority,
          status: savedTask.status || task.status,
          assignee: savedTask.assignee || task.assignee,
          description: savedTask.description || task.description
        };
      }
      return task;
    });

    return enhancedTasks;
  } catch (error) {
    console.error("Error getting tasks with recommendations:", error);
    return tasks; // Return original tasks if there's an error
  }
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
