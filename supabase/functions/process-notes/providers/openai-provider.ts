import { corsHeaders } from "../utils/cors.ts";

// Process task extraction with OpenAI
export async function processWithOpenAI(
  text: string, 
  projectName: string | null, 
  nameMatches: Record<string, any> = {}
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    // Prepare the system prompt for task extraction
    const namesList = Object.entries(nameMatches)
      .map(([name, user]) => `"${name}" -> "${user.name}" (ID: ${user.id})`)
      .join('\n');
    
    const systemPrompt = `
      You are a task extraction assistant. Your job is to extract actionable tasks from meeting notes, emails, or other text.
      ${projectName ? `These tasks will be added to the project: "${projectName}".` : ''}
      
      ${nameMatches && Object.keys(nameMatches).length > 0 ? 
        `Use these name mappings when assigning tasks:\n${namesList}` : 
        'If names are mentioned as assignees, include them in the "assignee" field.'
      }
      
      Each task should include:
      - title: A clear, concise task title
      - description: Optional detailed notes about the task
      - assignee: The person assigned to the task (if specified)
      - dueDate: Due date in YYYY-MM-DD format (if specified)
      - priority: "high", "medium", or "low" (if specified)
      - status: The current status (if specified), otherwise "todo"
      
      Return JSON with an array of tasks: { "tasks": [...] }
      If no tasks can be extracted, return: { "tasks": [] }
    `;
    
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
      
      // After receiving and parsing the response, check if we need to correct any assignee names
      const parsedResponse = JSON.parse(tasksContent);
      if (parsedResponse.tasks) {
        // Apply name matches to tasks
        parsedResponse.tasks = parsedResponse.tasks.map((task: any) => {
          if (task.assignee) {
            // Check if we have a match for this name
            const exactMatch = nameMatches[task.assignee];
            if (exactMatch) {
              task.assignee = exactMatch.name;
              task.assigneeId = exactMatch.id;
            }
          }
          return task;
        });
      }
      
      return new Response(
        JSON.stringify(parsedResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error using OpenAI:', error);
    throw error;
  }
}
