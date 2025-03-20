
import { corsHeaders } from "./cors.ts";

// Process and format the API response into tasks
export function processApiResponse(responseText: string, projectName: string | null) {
  console.log(`Processing response: ${responseText.length} characters`);
  
  // Parse the JSON response
  let tasks;
  try {
    // First try to parse directly
    try {
      tasks = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON by looking for array brackets
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      console.error('API response is not an array:', tasks);
      tasks = []; // Default to empty array if not array
    }
  } catch (error) {
    console.error('Error parsing API response as JSON:', error);
    console.log('Raw response:', responseText);
    throw new Error('Failed to parse tasks from API response');
  }
  
  // Add project name to tasks if provided and not already set
  if (projectName) {
    tasks = tasks.map(task => ({
      ...task,
      project: task.project || projectName
    }));
  }
  
  // Add id field to each task and map response fields to Task interface fields
  const processedTasks = tasks.map(task => ({
    id: crypto.randomUUID(),
    title: task.title || '',
    description: task.description || '',
    dueDate: task.due_date || null,
    priority: task.priority || null,
    status: task.status || 'todo',
    assignee: task.assignee || null,
    workspace_id: null,
    isRecurring: false,
    frequency: null,
    project: task.project || projectName || null,
  }));
  
  console.log(`Successfully extracted ${processedTasks.length} tasks`);
  
  return new Response(
    JSON.stringify({ tasks: processedTasks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Create error response with consistent formatting
export function createErrorResponse(error: Error) {
  console.error('Error in process-notes function:', error);
  return new Response(
    JSON.stringify({ 
      error: error.message || 'Unknown error',
      tasks: [] // Return empty tasks so the client can fall back to the simple parser
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
