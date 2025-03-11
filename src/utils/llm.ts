
import { supabase } from '@/lib/supabase';
import { Task } from '@/utils/parser';

/**
 * Process notes with OpenAI via Supabase edge function
 * @param text The note text to process
 * @param projectName Optional project name
 * @returns Extracted tasks
 */
export async function processNotesWithLLM(text: string, projectName: string | null): Promise<Task[]> {
  try {
    console.log(`Sending ${text.length} characters to process-notes function${projectName ? ` for project '${projectName}'` : ''}`);
    
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('process-notes', {
      body: { text, projectName },
    });

    if (error) {
      console.error('Error calling process-notes function:', error);
      throw new Error(`Failed to process notes: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from process-notes function');
      throw new Error('No data returned from LLM processing');
    }

    if (!data.tasks) {
      console.error('No tasks in response:', data);
      throw new Error('No tasks returned from LLM processing');
    }

    console.log(`Successfully received ${data.tasks.length} tasks from LLM processing`);
    return data.tasks as Task[];
  } catch (error) {
    console.error('Error in processNotesWithLLM:', error);
    throw error;
  }
}
