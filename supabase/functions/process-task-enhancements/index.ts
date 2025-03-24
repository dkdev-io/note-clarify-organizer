
import "xhr";
import { serve } from "std/http/server.ts";
import { Task } from "./types.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks } = await req.json();
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty tasks array' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing ${tasks.length} tasks with OpenAI`);
    
    // Create a prompt that explains what we want
    const systemPrompt = `You are a task enhancer assistant that helps improve task data to make it more complete and actionable. For each task, suggest improvements based on these criteria:
- Add missing due dates (in YYYY-MM-DD format) if none exist
- Add missing start dates (today's date if none suggested)
- Suggest appropriate priorities (high, medium, low) for tasks without priority
- Improve task descriptions to be more detailed and actionable
- Identify potential assignees based on task content
- Estimate completion time in minutes
- Identify any dependencies or blocking tasks

Analyze the provided tasks and return the enhanced tasks WITH your suggestions. DO NOT change the original data, only add NEW fields with your suggestions.

Add these fields to each task:
- suggestedDueDate: Suggested due date in YYYY-MM-DD format
- suggestedStartDate: Suggested start date in YYYY-MM-DD format
- suggestedPriority: Suggested priority (high, medium, low)
- suggestedDescription: Improved description
- suggestedAssignee: Suggested assignee
- suggestedTimeEstimate: Estimated completion time in minutes
- suggestedBlockingTasks: Array of task IDs that should block this task
- suggestedLabels: Array of suggested labels
- reasoning: Brief explanation for why these suggestions were made

Return ONLY a JSON object with an array of enhanced tasks.`;

    // Serialize the tasks for the prompt
    const tasksJSON = JSON.stringify(tasks, null, 2);
    
    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the lighter model for cost efficiency
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Enhance these tasks:\n${tasksJSON}` }
        ],
        temperature: 0.2, // Lower temperature for more deterministic outputs
        max_tokens: 2000, // Ensure enough space for response
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    let enhancedTasks;
    try {
      // Extract the JSON from the response
      const content = data.choices[0].message.content;
      // Try to parse the response as JSON
      enhancedTasks = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e);
      console.log('Raw response:', data.choices[0].message.content);
      
      // Fall back to returning the original tasks
      return new Response(
        JSON.stringify({ tasks, error: 'Failed to parse AI suggestions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Successfully enhanced tasks with OpenAI');
    
    return new Response(
      JSON.stringify(enhancedTasks),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing tasks:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing tasks' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
