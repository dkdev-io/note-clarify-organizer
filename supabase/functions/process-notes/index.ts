
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
    // Get OpenAI API key from environment variable
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured in environment variables',
          tasks: [] // Return empty tasks array so the app can use fallback
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          tasks: [] 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { text, projectName } = reqBody;
    
    if (!text) {
      console.error('Missing required parameter: text');
      return new Response(
        JSON.stringify({ 
          error: 'Text is required',
          tasks: [] 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing notes with OpenAI: ${text.length} characters${projectName ? ` for project '${projectName}'` : ''}`);

    // Prepare the system prompt for task extraction
    const systemPrompt = `You are a helpful task extraction assistant. Extract tasks from the provided notes.
Format each task as a JSON object with the following properties:
- title: The task title (required)
- description: Additional details about the task (optional)
- due_date: Due date in YYYY-MM-DD format if specified (optional)
- project: Project name if specified (optional)
- status: Status if specified (optional, default to "todo")
- priority: Priority if specified (optional, values can be "low", "medium", "high")

Return ONLY a JSON array of task objects, nothing else.`;

    // Prepare the user prompt
    const userPrompt = `Extract tasks from these notes${projectName ? ` for project "${projectName}"` : ''}:\n\n${text}`;

    console.log('Calling OpenAI API...');
    
    // Call OpenAI API with timeout and retry logic
    let response;
    let retries = 3; // Increase retries
    let delay = 1000; // Start with 1s delay
    
    while (retries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 second timeout (increased)
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Update to use gpt-4o-mini which is more reliable
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2, // Lower temperature for more deterministic responses
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          break; // Success, exit retry loop
        } else {
          const errorData = await response.json();
          console.error(`OpenAI API error (${response.status}):`, errorData);
          
          // If rate limited, wait longer
          if (response.status === 429) {
            retries--;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2; // Exponential backoff
            continue;
          } else {
            // For other errors, return gracefully with empty tasks
            return new Response(
              JSON.stringify({ 
                error: `OpenAI API error: ${errorData.error?.message || `Status ${response.status}`}`,
                tasks: []
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        if (error.name === 'AbortError') {
          console.error('Request timed out');
        }
        
        retries--;
        if (retries >= 0) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; // Exponential backoff
        } else {
          // Return gracefully with empty tasks after all retries
          return new Response(
            JSON.stringify({ 
              error: `Error calling OpenAI: ${error.message || 'Unknown error'}`,
              tasks: []
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // No successful response after retries
    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get a successful response from OpenAI after retries',
          tasks: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from OpenAI API',
          tasks: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const tasksContent = data.choices[0].message.content;
    
    console.log(`Received response from OpenAI: ${tasksContent.length} characters`);
    
    // Parse the JSON response
    let tasks;
    try {
      // First check if the response is directly parseable as JSON
      try {
        tasks = JSON.parse(tasksContent);
      } catch (e) {
        // If not, try to extract JSON by looking for array brackets
        const jsonMatch = tasksContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tasks = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      }
      
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) {
        console.error('OpenAI response is not an array:', tasks);
        tasks = []; // Default to empty array if not array
      }
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      console.log('Raw response:', tasksContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse tasks from OpenAI response',
          tasks: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      assignee: null,
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
  } catch (error) {
    console.error('Error in process-notes function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        tasks: [] // Return empty tasks so the client can fall back to the simple parser
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
