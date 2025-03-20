
import { corsHeaders } from "./cors.ts";

// Create error response with consistent formatting
export function createErrorResponse(error: Error, tasks = []) {
  console.error('Error in process-task-batch function:', error);
  return new Response(
    JSON.stringify({ 
      error: error.message || 'Unknown error',
      tasks: tasks // Return provided tasks or empty array so the client can handle the error
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Parse the enhanced tasks response
export function parseEnhancedTasks(responseText: string, originalTasks: any[]) {
  console.log(`Parsing enhanced tasks from ${responseText.length} characters`);
  
  try {
    // Try to parse as JSON directly
    let enhancedTasks;
    try {
      enhancedTasks = JSON.parse(responseText);
    } catch (e) {
      // Look for JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enhancedTasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    // Ensure we have an array
    if (!Array.isArray(enhancedTasks)) {
      throw new Error('Parsed response is not an array');
    }
    
    // Map the enhanced tasks back to the original task structure
    // while preserving important fields like ID
    return enhancedTasks.map((enhancedTask, index) => {
      // Find the corresponding original task
      const originalTask = originalTasks[index] || {};
      
      // Merge the enhanced task with the original task, preserving important fields
      return {
        ...originalTask,
        ...enhancedTask,
        // Always keep the original ID
        id: originalTask.id,
        // Always keep the original title unless it was empty
        title: originalTask.title || enhancedTask.title || '',
        // Use the enhanced project name or the original or the provided project name
        project: enhancedTask.project || originalTask.project || null,
        // Preserve new Motion fields if they exist in the original task
        startDate: enhancedTask.startDate || originalTask.startDate || null,
        hardDeadline: enhancedTask.hardDeadline || originalTask.hardDeadline || false,
        folder: enhancedTask.folder || originalTask.folder || null,
        autoScheduled: enhancedTask.autoScheduled !== undefined ? enhancedTask.autoScheduled : 
                      (originalTask.autoScheduled !== undefined ? originalTask.autoScheduled : true),
        isPending: enhancedTask.isPending || originalTask.isPending || false,
        schedule: enhancedTask.schedule || originalTask.schedule || "Work hours",
        labels: enhancedTask.labels || originalTask.labels || null,
        customFields: enhancedTask.customFields || originalTask.customFields || null
      };
    });
  } catch (error) {
    console.error('Error parsing enhanced tasks:', error);
    console.log('Raw response:', responseText);
    
    // Return the original tasks if parsing fails
    return originalTasks;
  }
}
