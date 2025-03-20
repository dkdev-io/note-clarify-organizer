
import { corsHeaders } from "../utils/cors.ts";
import { processApiResponse } from "../utils/response-handler.ts";

// Process notes with Hugging Face (simplified)
export async function processWithHuggingFace(text: string, projectName: string | null) {
  // Get Hugging Face API token from environment variable
  const huggingFaceToken = Deno.env.get('HUGGINGFACE_API_KEY');
  if (!huggingFaceToken) {
    console.error('Hugging Face API token not found in environment variables');
    throw new Error('Hugging Face API token not configured');
  }

  console.log('Using Hugging Face API...');
  
  // Create a prompt specifically for the Hugging Face model
  const prompt = `
Extract tasks from the following text${projectName ? ` for project "${projectName}"` : ''}:

"${text}"

Format your answer as a JSON array of task objects with these properties:
- title: task title (required)
- description: additional details (optional)
- due_date: due date in YYYY-MM-DD format if specified (optional)
- project: project name if specified (optional)
- status: task status (optional, default: "todo")
- priority: priority if specified (optional: "low", "medium", "high")
- assignee: person assigned to the task if specified (optional)

ONLY return the JSON array, nothing else.
`;

  // Use timeout to avoid hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
  
  try {
    // Call Hugging Face's inference API with a suitable open model
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${huggingFaceToken}`,
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

    return processApiResponse(generatedText, projectName);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Hugging Face API request timed out');
    }
    throw error;
  }
}
