
import { Task } from '@/utils/parser';
import { parseTextIntoTasks } from '@/utils/parser';
import { processNotesWithLLM } from '@/utils/llm';
import { ToastType } from './providers';

// Process notes with both LLM and fallback parser
export async function processNotes(
  text: string,
  effectiveProjectName: string | null,
  toast: ToastType
): Promise<{ tasks: Task[], usedFallback: boolean }> {
  // Always start with the fallback parser to ensure we have results
  const fallbackTasks = parseTextIntoTasks(text, effectiveProjectName);
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
      
      const llmPromise = processNotesWithLLM(text, effectiveProjectName);
      
      // Add a timeout for the entire LLM processing
      const timeoutPromise = new Promise<Task[]>((_, reject) => {
        setTimeout(() => reject(new Error('AI processing timed out after 15 seconds')), 15000);
      });
      
      // Race the LLM promise against the timeout
      const llmTasks = await Promise.race([llmPromise, timeoutPromise]);
      
      if (llmTasks && llmTasks.length > 0) {
        console.log(`LLM processor extracted ${llmTasks.length} tasks`);
        tasks = llmTasks;
        usedFallback = false;
        
        toast({
          title: "AI Processing Complete",
          description: `Successfully extracted ${tasks.length} tasks from your notes.`
        });
      } else {
        console.log('LLM processor returned no tasks, using fallback parser results');
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
  
  if (usedFallback) {
    toast({
      title: "Using basic task parser",
      description: `Extracted ${tasks.length} tasks using simple parsing.`
    });
  }
  
  return { tasks, usedFallback };
}
