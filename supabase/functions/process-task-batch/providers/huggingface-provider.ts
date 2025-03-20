
import { parseEnhancedTasks } from "../utils/response-handler.ts";

// Enhance tasks with Hugging Face
export async function enhanceTasksWithHuggingFace(tasks: any[], projectName: string | null) {
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
