
import { supabase } from '@/lib/supabase';
import { Task } from '@/utils/parser';

/**
 * Process notes with AI via Supabase edge function
 * @param text The note text to process
 * @param projectName Optional project name
 * @returns Extracted tasks
 */
export async function processNotesWithLLM(text: string, projectName: string | null): Promise<Task[]> {
  try {
    console.log(`Sending ${text.length} characters to process-notes function${projectName ? ` for project '${projectName}'` : ''}`);
    
    // Call the Supabase edge function with a shorter timeout handled in the client code
    const { data, error } = await Promise.race([
      supabase.functions.invoke('process-notes', {
        body: { text, projectName }
      }),
      new Promise<{ data: null, error: { message: string } }>((resolve) => 
        setTimeout(() => resolve({ 
          data: null, 
          error: { message: 'Client timeout: Function took too long to respond' } 
        }), 20000) // 20 seconds timeout is more than enough
      )
    ]);

    if (error) {
      console.error('Error calling process-notes function:', error);
      throw new Error(`Failed to process notes: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from process-notes function');
      throw new Error('No data returned from AI processing');
    }

    // Check for error message in the response 
    if (data.error) {
      console.error('Error from process-notes function:', data.error);
      // If we get an error but also tasks, log the error but return the tasks
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        console.log(`Function returned an error but also ${data.tasks.length} tasks. Using tasks despite error.`);
        return data.tasks as Task[];
      }
      throw new Error(`Error from AI processing: ${data.error}`);
    }

    // Check for unrecognized names in the response
    if (data.unrecognizedNames && Array.isArray(data.unrecognizedNames) && data.unrecognizedNames.length > 0) {
      console.warn('Unrecognized names in processed notes:', data.unrecognizedNames);
      const namesStr = data.unrecognizedNames.join(', ');
      throw new Error(`Unrecognized users in notes: ${namesStr}. Please verify these names exist in your Motion account.`);
    }

    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.error('No tasks array in response:', data);
      throw new Error('No tasks returned from AI processing');
    }

    console.log(`Successfully received ${data.tasks.length} tasks from AI processing`);
    return data.tasks as Task[];
  } catch (error) {
    console.error('Error in processNotesWithLLM:', error);
    throw error;
  }
}
