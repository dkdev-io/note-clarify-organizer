
/**
 * Motion API utilities for task operations
 */

import { getApiKey, isUsingProxyMode } from './api-core';
import { Task } from '../task-parser/types'; // Make sure to import from the correct path
import { getCurrentUser } from './current-user';

// Add tasks to Motion
export const addTasksToMotion = async (
  tasks: Task[], 
  workspaceId: string | null, 
  apiKey?: string,
  projectId?: string,
  timeEstimate?: string,
  users?: any[]
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
    // Get current user for default assignment
    let currentUser = null;
    try {
      currentUser = await getCurrentUser(apiKey);
      console.log('Current Motion user:', currentUser);
    } catch (error) {
      console.log('Could not fetch current user, tasks will be unassigned');
    }
    
    // Create an array to store any errors that occur
    const errors: any[] = [];
    const successfulTasks: Task[] = [];
    
    // Process tasks in sequence to avoid rate limiting
    for (const task of tasks) {
      try {
        // Prepare task data with CORRECT field names for the Motion API
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

        // Add due date if available - CORRECT FIELD NAME: dueDate
        if (task.dueDate) {
          // Format as ISO 8601 string
          taskData.dueDate = new Date(task.dueDate).toISOString();
          console.log(`Task due date: ${taskData.dueDate}`);
        }
        
        // Add duration (time estimate) if available - CORRECT FIELD NAME: duration
        if (timeEstimate) {
          taskData.duration = parseInt(timeEstimate, 10);
          console.log(`Task duration: ${taskData.duration} minutes`);
        } else if (task.timeEstimate) {
          taskData.duration = task.timeEstimate;
          console.log(`Task duration from task: ${taskData.duration} minutes`);
        }
        
        // Add auto scheduling preference - must be object or null
        if (task.autoScheduled !== undefined) {
          taskData.autoScheduled = task.autoScheduled ? {} : null;
        }
        
        // Add priority if available (ASAP, HIGH, MEDIUM, LOW)
        if (task.priority) {
          const priorityMap: { [key: string]: string } = {
            'high': 'HIGH',
            'medium': 'MEDIUM', 
            'low': 'LOW',
            'asap': 'ASAP'
          };
          taskData.priority = priorityMap[task.priority.toLowerCase()] || 'MEDIUM';
          console.log(`Task priority: ${taskData.priority}`);
        }
        
        // Add labels if available
        if (task.labels && task.labels.length > 0) {
          taskData.labels = task.labels;
        }
        
        // Add assigneeId - CORRECT FIELD NAME: assigneeId (not assignee_id)
        if (task.assignee) {
          // If a specific assignee is mentioned, look them up by name
          let assigneeId = null;
          
          // Try to find the user by name in the users list
          if (users && users.length > 0) {
            const foundUser = users.find(u => 
              u.name && u.name.toLowerCase().includes(task.assignee.toLowerCase())
            );
            if (foundUser) {
              assigneeId = foundUser.id;
              console.log(`Task "${task.title}" assigned to user '${foundUser.name}' (ID: ${foundUser.id})`);
            } else {
              console.log(`Could not find user '${task.assignee}' in Motion users list`);
            }
          }
          
          // If we found a user ID, use it; otherwise fall back to current user
          if (assigneeId) {
            taskData.assigneeId = assigneeId;
          } else if (currentUser && currentUser.id) {
            // Fallback to current user if we couldn't find the specified assignee
            taskData.assigneeId = currentUser.id;
            console.log(`Task "${task.title}" fallback assigned to current user: ${currentUser.name || currentUser.id}`);
          } else {
            console.log(`Task "${task.title}" will be unassigned (no user '${task.assignee}' found)`);
          }
        } else if (currentUser && currentUser.id) {
          // If no assignee specified, assign to current Motion user
          taskData.assigneeId = currentUser.id;
          console.log(`Task "${task.title}" auto-assigned to current user: ${currentUser.name || currentUser.id}`);
        } else {
          console.log(`Task "${task.title}" will be unassigned`);
        }
        
        console.error("🚨🚨🚨 SENDING TASK TO MOTION 🚨🚨🚨");
        console.error("Task data:", taskData);
        console.error("API Key:", apiKey ? (apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5)) : "NULL");
        console.error("🚨 FULL REQUEST BODY:", JSON.stringify(taskData, null, 2));
        
        // Add rate limiting with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let response;
        
        while (retryCount < maxRetries) {
          try {
            const requestUrl = "https://api.usemotion.com/v1/tasks";
            console.log(`Making POST request to: ${requestUrl}`);
            
            response = await fetch(requestUrl, {
              method: "POST",
              headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(taskData),
            });
            
            console.log(`Response status: ${response.status} ${response.statusText}`);
            
            if (response.status === 429) {
              // Rate limited, wait and retry
              const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
              console.log(`Rate limited on task creation, waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            }
            
            break; // Success or non-rate-limit error, exit retry loop
          } catch (fetchError) {
            if (retryCount === maxRetries - 1) {
              throw fetchError;
            }
            retryCount++;
            const waitTime = Math.pow(2, retryCount) * 1000;
            console.log(`Fetch error on task creation, waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = await response.text();
          }
          console.error("🚨🚨🚨 MOTION API ERROR 🚨🚨🚨");
          console.error("Status:", response.status);
          console.error("Status Text:", response.statusText);
          console.error("Error Data:", errorData);
          console.error("Task Title:", task.title);
          console.error("Request Body:", taskData);
          errors.push({
            task: task.title,
            error: errorData,
            status: response.status
          });
        } else {
          const responseData = await response.json();
          console.log("✅ Success creating task:", responseData);
          console.log("Task ID in Motion:", responseData.id);
          successfulTasks.push(task);
        }
      } catch (err) {
        console.error("Error processing individual task:", err);
        errors.push({
          task: task.title,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
      
      // Add delay between task creation to avoid rate limiting
      if (tasks.indexOf(task) < tasks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between tasks
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
