import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { processNotesWithLLM } from '@/utils/llm';
import { ToastType } from './providers';
import { findUserMatches } from '@/utils/name-matching';

// Process notes with both LLM and fallback parser
export async function processNotes(
  text: string,
  effectiveProjectName: string | null,
  toast: ToastType,
  motionUsers: any[] = [],
  apiKey?: string
): Promise<{ tasks: Task[], usedFallback: boolean }> {
  // Always start with the fallback parser to ensure we have results
  const fallbackTasks = await parseTextIntoTasks(text, effectiveProjectName, apiKey);
  console.log(`Fallback parser extracted ${fallbackTasks.length} tasks`);
  
  let tasks: Task[] = fallbackTasks;
  let usedFallback = true;
  
  try {
    // Attempt to use the LLM processor if we have more than simple task text
    if (text.length > 50) {
      console.log('Attempting to use LLM processor...');
      
      toast({
        title: "Processing notes with AI",
        description: "This might take a few seconds..."
      });
      
      // Add a timeout for the entire LLM processing
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI processing timed out after 15 seconds')), 15000);
      });
      
      // Process notes with LLM
      try {
        const llmResult = await Promise.race([
          processNotesWithLLM(text, effectiveProjectName, motionUsers),
          timeoutPromise
        ]);
        
        // Process user matches automatically
        const processedResult = handleUserMatching(llmResult.tasks, motionUsers);
        
        // If we have tasks from LLM, use them
        if (processedResult && processedResult.length > 0) {
          console.log(`LLM processor extracted ${processedResult.length} tasks`);
          tasks = processedResult;
          usedFallback = false;
          
          toast({
            title: "AI Processing Complete",
            description: `Successfully extracted ${tasks.length} tasks from your notes.`
          });
        } else {
          console.log('LLM processor returned no tasks, using fallback parser results');
        }
      } catch (error) {
        // Handle specific error for timeout
        if (error.message && error.message.includes('timed out')) {
          console.error('LLM processing timed out:', error);
          toast({
            title: "AI processing timed out",
            description: "Using basic parser instead. Try again with shorter text.",
            variant: "destructive"
          });
        } else {
          // General error handling
          console.error('Error in LLM processing:', error);
          throw error; // Re-throw to be caught by outer catch
        }
      }
    } else {
      console.log('Text too short, skipping LLM processing');
    }
  } catch (error) {
    console.error("Error using LLM processor, using fallback parser results:", error);
    
    // Provide a helpful error message based on the type of error
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('exceeded your current quota') || 
        errorMessage.includes('API key')) {
      toast({
        title: "AI service unavailable",
        description: "Using basic parser due to AI service limitations."
      });
    } else if (errorMessage.includes('timeout')) {
      toast({
        title: "AI processing timed out",
        description: "Using basic parser instead. Try again with shorter text."
      });
    } else {
      toast({
        title: "Using basic task parser",
        description: "AI processing unavailable. Using simple parsing instead."
      });
    }
  }
  
  // Process the fallback tasks as well for user matching if we're using them
  if (usedFallback) {
    tasks = handleUserMatching(tasks, motionUsers);
    
    toast({
      title: "Using basic task parser",
      description: `Extracted ${tasks.length} tasks using simple parsing.`
    });
  }
  
  return { tasks, usedFallback };
}

// Helper function to automatically match users with best effort
function handleUserMatching(tasks: Task[], users: any[]): Task[] {
  if (!users || users.length === 0) {
    return tasks;
  }
  
  return tasks.map(task => {
    // If no assignee, try to set to the current user
    if (!task.assignee) {
      // If we have users, try to use the first one (current user)
      if (users.length > 0) {
        const currentUser = users[0]; // Assume first user is the current user
        return {
          ...task,
          assignee: currentUser.name || "Me",
          assigneeId: currentUser.id
        };
      } else {
        // If no users available, keep default assignee from parser
        return {
          ...task,
          assignee: task.assignee || "Me"
        };
      }
    }
    
    // Skip if already matched
    if (!task.assignee) {
      return task;
    }
    
    // Try to find a match for the assigned name
    const matches = findUserMatches(task.assignee, users, 0.5); // Lower threshold for better matching
    
    if (matches && matches.length > 0) {
      // Use the best match (first one)
      const bestMatch = matches[0];
      console.log(`Auto-matched "${task.assignee}" to user "${bestMatch.name}" (id: ${bestMatch.id})`);
      
      // Return the task with the matched user details
      return {
        ...task,
        assignee: bestMatch.name,
        assigneeId: bestMatch.id
      };
    }
    
    // If no match found, keep the original task
    console.log(`Couldn't find a match for "${task.assignee}", keeping as is`);
    return task;
  });
}
