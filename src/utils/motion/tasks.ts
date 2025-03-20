
/**
 * Motion API utilities for task operations
 */

import { getApiKey, isUsingProxyMode } from './api-core';
import { Task } from '../task-parser/types'; // Make sure to import from the correct path

// Add tasks to Motion
export const addTasksToMotion = async (
  tasks: Task[], 
  workspaceId: string | null, 
  apiKey?: string,
  projectId?: string,
  timeEstimate?: string
): Promise<{ success: boolean; message: string; errors?: any[] }> => {
  // If we're in proxy mode, simulate successful task creation
  if (apiKey === 'proxy_mode' || isUsingProxyMode()) {
    console.log('Using proxy mode, simulating task creation');
    return {
      success: true,
      message: `Successfully added ${tasks.length} tasks to Motion using proxy mode`,
    };
  }

  if (!workspaceId || !apiKey) {
    return { 
      success: false, 
      message: "Missing workspace ID or API key" 
    };
  }

  try {
    // Create an array to store any errors that occur
    const errors: any[] = [];
    const successfulTasks: Task[] = [];
    
    // Process tasks in sequence to avoid rate limiting
    for (const task of tasks) {
      try {
        // Prepare task data with proper field names for the Motion API
        const taskData: any = {
          name: task.title,
          description: task.description || "",
          workspaceId: workspaceId,
        };
        
        // Add projectId if provided either directly or from the task
        if (projectId) {
          taskData.projectId = projectId;
          console.log(`Adding task "${task.title}" to project ID: ${projectId}`);
        } else if (task.projectId) {
          taskData.projectId = task.projectId;
          console.log(`Adding task "${task.title}" to task's project ID: ${task.projectId}`);
        } else {
          console.log(`Adding task "${task.title}" without project ID`);
        }
        
        // Add folder if available
        if (task.folder) {
          taskData.folder = task.folder;
        }

        // Add due date if available
        if (task.dueDate) {
          // Format the date as ISO string (YYYY-MM-DD)
          taskData.dueDate = new Date(task.dueDate).toISOString().split('T')[0];
          console.log(`Task due date: ${taskData.dueDate}`);
          
          // Add hard deadline flag if set
          if (task.hardDeadline) {
            taskData.hardDeadline = true;
          }
        }
        
        // Add start date if available
        if (task.startDate) {
          taskData.startDate = new Date(task.startDate).toISOString().split('T')[0];
          console.log(`Task start date: ${taskData.startDate}`);
        }
        
        // Add time estimate if available
        if (timeEstimate) {
          taskData.timeEstimate = parseInt(timeEstimate, 10);
          console.log(`Task time estimate: ${taskData.timeEstimate} minutes`);
        } else if (task.timeEstimate) {
          taskData.timeEstimate = task.timeEstimate;
          console.log(`Task time estimate from task: ${taskData.timeEstimate} minutes`);
        }
        
        // Add auto scheduling preference
        taskData.autoScheduled = task.autoScheduled !== undefined ? task.autoScheduled : true;
        
        // Add isPending flag
        if (task.isPending) {
          taskData.isPending = true;
        }
        
        // Add schedule preference
        if (task.schedule) {
          taskData.schedule = task.schedule;
        }
        
        // Add labels if available
        if (task.labels && task.labels.length > 0) {
          taskData.labels = task.labels;
        }
        
        // Add custom fields if available
        if (task.customFields) {
          taskData.customFields = task.customFields;
        }
        
        console.log("Sending task to Motion:", taskData);
        
        // Call the Motion API to create the task
        const response = await fetch("https://api.usemotion.com/v1/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating task:", errorData);
          errors.push({
            task: task.title,
            error: errorData,
            status: response.status
          });
        } else {
          const responseData = await response.json();
          console.log("Success creating task:", responseData);
          successfulTasks.push(task);
        }
      } catch (err) {
        console.error("Error processing individual task:", err);
        errors.push({
          task: task.title,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
    
    // Determine if the operation was successful overall
    if (errors.length === 0) {
      return {
        success: true,
        message: `Successfully added ${tasks.length} tasks to Motion`,
      };
    } else if (successfulTasks.length > 0) {
      return {
        success: true,
        message: `Added ${successfulTasks.length} out of ${tasks.length} tasks to Motion`,
        errors,
      };
    } else {
      return {
        success: false,
        message: "Failed to add tasks to Motion. See errors below",
        errors,
      };
    }
  } catch (error) {
    console.error("Error adding tasks to Motion:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
