
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, handleCors } from "./utils/cors.ts";
import { createErrorResponse } from "./utils/response-handler.ts";
import { enhanceTasksWithOpenAI } from "./providers/openai-provider.ts";
import { enhanceTasksWithHuggingFace } from "./providers/huggingface-provider.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
      // Try with OpenAI first
      console.log('Attempting to enhance tasks with OpenAI...');
      const enhancedTasks = await enhanceTasksWithOpenAI(tasks, projectName);
      console.log('Successfully enhanced tasks with OpenAI');
      return new Response(
        JSON.stringify({ tasks: enhancedTasks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAiError) {
      console.error('Error enhancing tasks with OpenAI:', openAiError);
      
      // Fallback to Hugging Face if OpenAI fails
      try {
        console.log('Attempting fallback to Hugging Face...');
        const enhancedTasks = await enhanceTasksWithHuggingFace(tasks, projectName);
        console.log('Successfully enhanced tasks with Hugging Face');
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
    return createErrorResponse(error);
  }
});
