
import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { processNotesWithLLM } from '@/utils/llm';
import { ToastType } from './providers';

// Process notes with both LLM and fallback parser
export async function processNotes(
  text: string,
  effectiveProjectName: string | null,
  toast: ToastType,
  motionUsers: any[] = []
): Promise<{ tasks: Task[], usedFallback: boolean, unrecognizedNames?: string[] }> {
  // Always start with the fallback parser to ensure we have results
  const fallbackTasks = parseTextIntoTasks(text, effectiveProjectName);
  console.log(`Fallback parser extracted ${fallbackTasks.length} tasks`);
  
  let tasks: Task[] = fallbackTasks;
  let usedFallback = true;
  let unrecognizedNames: string[] | undefined = undefined;
  
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
        
        // Check if we have unrecognized names
        if (llmResult.unrecognizedNames && llmResult.unrecognizedNames.length > 0) {
          console.log('Detected unrecognized names:', llmResult.unrecognizedNames);
          unrecognizedNames = llmResult.unrecognizedNames;
          // Return the fallback tasks along with unrecognized names
          return { tasks: fallbackTasks, usedFallback: true, unrecognizedNames };
        }
        
        // If we have tasks from LLM, use them
        if (llmResult.tasks && llmResult.tasks.length > 0) {
          console.log(`LLM processor extracted ${llmResult.tasks.length} tasks`);
          tasks = llmResult.tasks;
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
    
    if (errorMessage.includes('Unrecognized users')) {
      toast({
        title: "Unrecognized users in notes",
        description: errorMessage,
        variant: "destructive"
      });
    } else if (errorMessage.includes('exceeded your current quota') || 
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
  
  if (usedFallback) {
    toast({
      title: "Using basic task parser",
      description: `Extracted ${tasks.length} tasks using simple parsing.`
    });
  }
  
  return { tasks, usedFallback, unrecognizedNames };
}
