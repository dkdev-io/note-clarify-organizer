
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { tasks } = await req.json();
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty tasks array provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // This function would normally call an external LLM API
    // For now, we'll return mock-enhanced tasks with suggestions
    const enhancedTasks = tasks.map(task => {
      // Generate appropriate suggestions based on missing information
      const suggestions = {
        suggestedDueDate: task.dueDate ? null : getNextWeekday(new Date()),
        suggestedPriority: task.priority ? null : getPriorityFromTitle(task.title),
        suggestedDescription: (!task.description || task.description.length < 10) 
          ? generateDescription(task.title) 
          : null,
        reasoning: "AI analysis suggests these improvements to make this task more actionable."
      };
      
      // Only include suggestions object if we have at least one suggestion
      const hasSuggestions = 
        suggestions.suggestedDueDate || 
        suggestions.suggestedPriority || 
        suggestions.suggestedDescription;
      
      return {
        ...task,
        suggestions: hasSuggestions ? suggestions : null
      };
    });

    return new Response(
      JSON.stringify({ tasks: enhancedTasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing task enhancements:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing task enhancements' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
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
