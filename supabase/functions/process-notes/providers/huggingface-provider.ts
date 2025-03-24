import { corsHeaders } from "../utils/cors.ts";

// Process task extraction with Hugging Face
export async function processWithHuggingFace(
  text: string, 
  projectName: string | null,
  nameMatches: Record<string, any> = {}
) {
  const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
  
  if (!huggingFaceApiKey) {
    throw new Error('Hugging Face API key is not configured');
  }
  
  try {
    // Include name mapping in prompt
    const namesList = Object.entries(nameMatches)
      .map(([name, user]) => `"${name}" -> "${user.name}"`)
      .join('\n');
    
    const prompt = `
      Extract tasks from the following text:
      
      ${text}
      
      ${projectName ? `These tasks are for the project: "${projectName}".` : ''}
      
      ${nameMatches && Object.keys(nameMatches).length > 0 ? 
        `Use these name mappings when assigning tasks:\n${namesList}` : 
        'If names are mentioned as assignees, include them in the tasks.'
      }
      
      Return a JSON object with an array of tasks. Each task should have:
      - title: The task name
      - description: Details about the task (optional)
      - assignee: Who should do the task (if mentioned)
      - dueDate: When it's due in YYYY-MM-DD format (if mentioned)
      - priority: "high", "medium", or "low" (if mentioned)
      
      Format: { "tasks": [...] }
    `;
    
    // Use timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
    
    try {
      // Call Hugging Face's inference API with a suitable open model
      const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.1,
            return_full_text: false
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Hugging Face API error (${response.status}):`, errorText);
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the generated text
      const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;
      
      if (!generatedText) {
        console.error('Invalid response from Hugging Face:', data);
        throw new Error('Invalid response from Hugging Face API');
      }

      // Process assignees based on name matches
      const parsedResponse = JSON.parse(generatedText);
      if (parsedResponse.tasks) {
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
        throw new Error('Hugging Face API request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error using Hugging Face:', error);
    throw error;
  }
}
