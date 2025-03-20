
import { corsHeaders } from "../utils/cors.ts";
import { processApiResponse } from "../utils/response-handler.ts";

// Process notes with OpenAI with improved error handling
export async function processWithOpenAI(text: string, projectName: string | null) {
  // Get OpenAI API key from environment variable
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OpenAI API key not configured');
  }

  // Prepare the system prompt for task extraction
  const systemPrompt = `You are a helpful task extraction assistant. Extract tasks from the provided notes.
Format each task as a JSON object with the following properties:
- title: The task title (required)
- description: Additional details about the task (optional)
- due_date: Due date in YYYY-MM-DD format if specified (optional)
- project: Project name if specified (optional)
- status: Status if specified (optional, default to "todo")
- priority: Priority if specified (optional, values can be "low", "medium", "high")
- assignee: Person assigned to the task if specified (optional)

Return ONLY a JSON array of task objects, nothing else.`;

  // Prepare the user prompt
  const userPrompt = `Extract tasks from these notes${projectName ? ` for project "${projectName}"` : ''}:\n\n${text}`;

  console.log('Calling OpenAI API...');
  
  // Use OpenAI with timeout to avoid hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use gpt-4o-mini for reliability
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Lower temperature for more deterministic outputs
        max_tokens: 1500, // Ensure enough space for response
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
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
    return processApiResponse(tasksContent, projectName);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out');
    }
    throw error;
  }
}
