
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { extractNamesFromTasks } from "./utils/name-extraction.ts";
import { handleResponse } from "./utils/response-handler.ts";
import { processWithHuggingFace } from "./providers/huggingface-provider.ts";
import { processWithOpenAI } from "./providers/openai-provider.ts";

// Configure which provider to use
const PROVIDER = Deno.env.get("PROVIDER") || "openai";

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, provider = PROVIDER } = await req.json();

    if (!text) {
      return handleResponse({
        status: 400,
        data: { error: "Missing 'text' parameter in request body" }
      });
    }

    console.log(`Processing text with ${provider}...`);

    // Process notes with the selected provider
    let result;
    switch(provider.toLowerCase()) {
      case "huggingface":
        result = await processWithHuggingFace(text);
        break;
      case "openai":
      default:
        result = await processWithOpenAI(text);
        break;
    }

    // Extract user names for name resolution
    if (result.tasks && Array.isArray(result.tasks)) {
      const names = extractNamesFromTasks(result.tasks);
      if (names.length > 0) {
        result.unrecognizedNames = names;
      }
    }

    console.log("Processing complete. Tasks found:", result.tasks?.length || 0);
    
    return handleResponse({
      status: 200,
      data: result
    });
  } catch (error) {
    console.error("Error processing notes:", error);
    
    return handleResponse({
      status: 500,
      data: { 
        error: "Internal server error while processing notes", 
        details: error.message 
      }
    });
  }
});
