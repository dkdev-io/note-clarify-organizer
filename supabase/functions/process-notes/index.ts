
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
      throw new Error('OpenAI API key not found');
    }

    // Parse request body
    const { text, projectName } = await req.json();
    
    if (!text) {
      console.error('Missing required parameter: text');
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more deterministic responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`OpenAI API error (${response.status}):`, errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || `Status ${response.status}`}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const tasksContent = data.choices[0].message.content;
    
    console.log(`Received response from OpenAI: ${tasksContent.length} characters`);
    
    // Parse the JSON response
    let tasks;
    try {
      tasks = JSON.parse(tasksContent);
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) {
        console.error('OpenAI response is not an array:', tasks);
        tasks = []; // Default to empty array if not array
      }
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      console.log('Raw response:', tasksContent);
      throw new Error('Failed to parse tasks from OpenAI response');
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
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
