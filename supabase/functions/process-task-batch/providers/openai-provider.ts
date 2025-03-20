
import { parseEnhancedTasks } from "../utils/response-handler.ts";

// Enhance tasks with OpenAI
export async function enhanceTasksWithOpenAI(tasks: any[], projectName: string | null) {
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
