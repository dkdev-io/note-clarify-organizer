
import { supabase } from '@/lib/supabase';
import { Task } from '@/utils/parser';

/**
 * Process notes with AI via Supabase edge function
 * @param text The note text to process
 * @param projectName Optional project name
 * @param users Optional array of Motion users for name verification
 * @returns Extracted tasks and any unrecognized names
 */
export async function processNotesWithLLM(
  text: string, 
  projectName: string | null,
  users?: any[]
): Promise<{ tasks: Task[], unrecognizedNames?: string[] }> {
  try {
    console.log(`Sending ${text.length} characters to process-notes function${projectName ? ` for project '${projectName}'` : ''}`);
    
    // Create a more manageable timeout
    const timeout = 15000; // 15 seconds
    
    // Call the Supabase edge function with proper timeout handling
    const { data, error } = await Promise.race([
      supabase.functions.invoke('process-notes', {
        body: { text, projectName, motionUsers: users }
      }),
      new Promise<{ data: null, error: { message: string } }>((resolve) => 
        setTimeout(() => resolve({ 
          data: null, 
          error: { message: 'Client timeout: Function took too long to respond' } 
        }), timeout)
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

    // Check for unrecognized names in the response
    if (data.unrecognizedNames && Array.isArray(data.unrecognizedNames) && data.unrecognizedNames.length > 0) {
      console.warn('Unrecognized names in processed notes:', data.unrecognizedNames);
      return { 
        tasks: [], 
        unrecognizedNames: data.unrecognizedNames 
      };
    }

    // Check for error message in the response
    if (data.error) {
      console.error('Error from process-notes function:', data.error);
      throw new Error(`Error from AI processing: ${data.error}`);
    }

    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.error('No tasks array in response:', data);
      throw new Error('No tasks returned from AI processing');
    }

    console.log(`Successfully received ${data.tasks.length} tasks from AI processing`);
    return { tasks: data.tasks };
  } catch (error) {
    console.error('Error in processNotesWithLLM:', error);
    throw error;
  }
}
