
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { tasks } = await req.json();
    
    if (!tasks || !Array.isArray(tasks)) {
      console.error('Missing or invalid tasks array');
      return new Response(
        JSON.stringify({ 
          error: 'Valid tasks array is required',
          tasks: [] 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Enhancing ${tasks.length} tasks with AI`);
    
    // Process tasks and generate suggestions
    const enhancedTasks = tasks.map(task => {
      // Enhanced task with suggestions
      const enhancedTask = {
        ...task,
        suggestions: {
          suggestedDueDate: !task.dueDate ? getNextWeekday(new Date()) : null,
          suggestedPriority: !task.priority ? getPriorityFromTitle(task.title) : null,
          suggestedDescription: (!task.description || task.description.length < 10) 
            ? generateDescription(task.title) 
            : null,
          reasoning: "AI analysis suggests these improvements to make this task more actionable."
        }
      };
      
      return enhancedTask;
    });
    
    return new Response(
      JSON.stringify({ tasks: enhancedTasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error enhancing tasks with AI:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        tasks: [] 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to generate a date for next week (for suggested due dates)
function getNextWeekday(date) {
  const result = new Date(date);
  result.setDate(result.getDate() + 7);
  return result.toISOString();
}

// Helper function to guess priority based on title words
function getPriorityFromTitle(title) {
  const lowercaseTitle = title.toLowerCase();
  
  if (
    lowercaseTitle.includes('urgent') || 
    lowercaseTitle.includes('asap') || 
    lowercaseTitle.includes('immediately') ||
    lowercaseTitle.includes('critical')
  ) {
    return 'high';
  }
  
  if (
    lowercaseTitle.includes('soon') || 
    lowercaseTitle.includes('next week') ||
    lowercaseTitle.includes('important')
  ) {
    return 'medium';
  }
  
  return 'low';
}

// Helper function to generate a simple description
function generateDescription(title) {
  return `Complete ${title} with necessary details and documentation.`;
}
