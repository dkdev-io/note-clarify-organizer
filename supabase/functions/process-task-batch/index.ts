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
    const { tasks, projectName } = await req.json();
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      console.error('Missing or invalid tasks array');
      return new Response(
        JSON.stringify({ 
          error: 'Valid tasks array is required',
          tasks: [] 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${tasks.length} tasks${projectName ? ` for project '${projectName}'` : ''}`);

    // Process tasks with AI
    try {
      const enhancedTasks = await enhanceTasksWithOpenAI(tasks, projectName);
      return new Response(
        JSON.stringify({ tasks: enhancedTasks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error enhancing tasks with OpenAI:', error);
      
      // Fallback to Hugging Face if OpenAI fails
      try {
        const enhancedTasks = await enhanceTasksWithHuggingFace(tasks, projectName);
        return new Response(
          JSON.stringify({ tasks: enhancedTasks }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (hfError) {
        console.error('Error enhancing tasks with Hugging Face:', hfError);
        throw new Error('All AI enhancement methods failed');
      }
    }
  } catch (error) {
    console.error('Error in process-task-batch function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        tasks: [] // Return empty tasks array so the client can handle the error
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhance tasks with OpenAI
async function enhanceTasksWithOpenAI(tasks, projectName) {
  // Get OpenAI API key
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  // Prepare system prompt for task enhancement
  const systemPrompt = `You are a task enhancement assistant. Improve the provided tasks with better descriptions, 
due dates, priorities, etc. where applicable. Return the tasks as a JSON array with all fields from the input preserved.
You can add or improve these fields:
- description: Add details about implementation steps, resources needed, or clarifications
- due_date: Suggest a realistic due date in YYYY-MM-DD format if not provided
- priority: Suggest priority (low, medium, high) based on task content if not provided
Do NOT change the task titles or IDs. Make minimal, helpful improvements only.`;

  // Format the tasks as a readable string for the AI
  const tasksString = JSON.stringify(tasks, null, 2);
  
  // Prepare the user prompt
  const userPrompt = `Enhance these tasks${projectName ? ` for project "${projectName}"` : ''}:
${tasksString}

Return ONLY the enhanced tasks as a JSON array, nothing else.`;

  console.log('Calling OpenAI API for task enhancement...');
  
  // Set a timeout to avoid hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
  
  try {
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
        temperature: 0.2,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || `Status ${response.status}`}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const enhancedTasksContent = data.choices[0].message.content;
    
    // Parse the enhanced tasks
    return parseEnhancedTasks(enhancedTasksContent, tasks);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out');
    }
    throw error;
  }
}

// Enhance tasks with Hugging Face
async function enhanceTasksWithHuggingFace(tasks, projectName) {
  // Get Hugging Face API token
  const huggingFaceToken = Deno.env.get('HUGGINGFACE_API_KEY');
  if (!huggingFaceToken) {
    throw new Error('Hugging Face API token not configured');
  }
  
  // Format the tasks as a readable string for the AI
  const tasksString = JSON.stringify(tasks, null, 2);
  
  // Create a prompt for the Hugging Face model
  const prompt = `
Enhance these tasks${projectName ? ` for project "${projectName}"` : ''}:

${tasksString}

For each task, improve these fields without changing the task title or ID:
1. Add or improve description with helpful details
2. Suggest a due date in YYYY-MM-DD format if missing
3. Suggest priority (low, medium, high) based on content if missing

Return ONLY the enhanced tasks as a JSON array, nothing else.
`;

  console.log('Calling Hugging Face API for task enhancement...');
  
  // Set a timeout to avoid hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
  
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${huggingFaceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.2,
          return_full_text: false
        }
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the generated text
    const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    
    if (!generatedText) {
      throw new Error('Invalid response from Hugging Face API');
    }
    
    // Parse the enhanced tasks
    return parseEnhancedTasks(generatedText, tasks);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Hugging Face API request timed out');
    }
    throw error;
  }
}

// Parse the enhanced tasks response
function parseEnhancedTasks(responseText, originalTasks) {
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
      };
    });
  } catch (error) {
    console.error('Error parsing enhanced tasks:', error);
    console.log('Raw response:', responseText);
    
    // Return the original tasks if parsing fails
    return originalTasks;
  }
}
