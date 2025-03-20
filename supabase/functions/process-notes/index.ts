
import { serve } from "std/http/server.ts";
import "xhr";
import { handleCors, corsHeaders } from "./utils/cors.ts";
import { verifyNames } from "./utils/name-extraction.ts";
import { createErrorResponse } from "./utils/response-handler.ts";
import { processWithOpenAI } from "./providers/openai-provider.ts";
import { processWithHuggingFace } from "./providers/huggingface-provider.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
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
    
    const { text, projectName, motionUsers } = reqBody;
    
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
    
    console.log(`Processing notes: ${text.length} characters${projectName ? ` for project '${projectName}'` : ''}`);
    console.log(`Available Motion users: ${motionUsers ? motionUsers.length : 0}`);

    // Check for unrecognized names if motionUsers provided
    const nameVerificationResponse = verifyNames(text, motionUsers);
    if (nameVerificationResponse) return nameVerificationResponse;

    // Try to use OpenAI, with simplified error handling and retry logic
    try {
      console.log('Attempting to process with OpenAI...');
      const openaiResult = await processWithOpenAI(text, projectName);
      console.log('Successfully processed with OpenAI');
      return openaiResult;
    } catch (openAiError) {
      console.error('OpenAI processing failed:', openAiError);
      
      // If OpenAI fails with a quota error, try Hugging Face
      if (openAiError.message && (
          openAiError.message.includes('quota') || 
          openAiError.message.includes('rate limit') ||
          openAiError.message.includes('API key')
        )) {
        try {
          console.log('Attempting fallback to Hugging Face...');
          const huggingFaceResult = await processWithHuggingFace(text, projectName);
          console.log('Successfully processed with Hugging Face');
          return huggingFaceResult;
        } catch (hfError) {
          console.error('Hugging Face processing also failed:', hfError);
          throw new Error('All AI processing methods failed');
        }
      } else {
        // For other errors, just throw the original error
        throw openAiError;
      }
    }
  } catch (error) {
    return createErrorResponse(error);
  }
});
