
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
    if (motionUsers && Array.isArray(motionUsers) && motionUsers.length > 0) {
      const extractedNames = extractNamesFromText(text);
      console.log('Extracted potential names from text:', extractedNames);
      
      const unrecognizedNames = findUnrecognizedNames(extractedNames, motionUsers);
      
      if (unrecognizedNames.length > 0) {
        console.warn('Found unrecognized names:', unrecognizedNames);
        return new Response(
          JSON.stringify({ 
            unrecognizedNames, 
            tasks: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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
    console.error('Error in process-notes function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        tasks: [] // Return empty tasks so the client can fall back to the simple parser
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Extract potential names from text
function extractNamesFromText(text) {
  // Look for patterns like "Name will..." which typically indicate a task assignment
  const namePatterns = [
    /(\b[A-Z][a-z]+\b)\s+will\b/g,           // "Name will..."
    /(\b[A-Z][a-z]+\b)\s+(?:should|needs to|has to|must)\b/g,  // "Name should/needs to/has to/must..."
    /\bassign(?:ed)?\s+to\s+(\b[A-Z][a-z]+\b)/gi,  // "assigned to Name"
    /(\b[A-Z][a-z]+\b)'s\s+(?:task|responsibility|job)/g,  // "Name's task/responsibility/job"
    /(\b[A-Z][a-z]+\b)\s+is\s+(?:responsible|assigned)/g,  // "Name is responsible/assigned"
  ];
  
  let allNames = [];
  
  // Apply each pattern and collect names
  for (const pattern of namePatterns) {
    const matches = [...text.matchAll(pattern)];
    const names = matches.map(match => match[1]);
    allNames = [...allNames, ...names];
  }
  
  // Return unique names
  return [...new Set(allNames)];
}

// Check if names in the text exist in the Motion users
function findUnrecognizedNames(extractedNames, motionUsers) {
  if (!motionUsers || !Array.isArray(motionUsers) || motionUsers.length === 0) {
    return []; // Can't verify without user list
  }
  
  console.log('Checking names against Motion users:', extractedNames);
  
  const userNames = motionUsers.map(user => {
    // Get both full name and first name
    const fullName = user.name || '';
    const firstName = fullName.split(' ')[0].toLowerCase();
    return { fullName: fullName.toLowerCase(), firstName };
  }).filter(name => name.firstName); // Remove empty names
  
  return extractedNames.filter(name => {
    const nameLower = name.toLowerCase();
    
    // Check direct match with first names
    if (userNames.some(user => user.firstName === nameLower)) {
      return false; // Name is recognized
    }
    
    // Check full name match
    if (userNames.some(user => user.fullName.includes(nameLower))) {
      return false; // Name is recognized
    }
    
    // Check partial matches (e.g., "Dan" could match "Daniel")
    for (const userName of userNames) {
      // Check if name is contained in username or vice versa
      if (userName.firstName.includes(nameLower) || nameLower.includes(userName.firstName)) {
        if (nameLower.length > 2) { // Avoid matching single letters
          return false; // Name is potentially recognized
        }
      }
    }
    
    return true; // Name is not recognized
  });
}

// Process notes with OpenAI with improved error handling
async function processWithOpenAI(text, projectName) {
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
    return processApiResponse(tasksContent, projectName, corsHeaders);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out');
    }
    throw error;
  }
}

// Process notes with Hugging Face (simplified)
async function processWithHuggingFace(text, projectName) {
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

    return processApiResponse(generatedText, projectName, corsHeaders);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Hugging Face API request timed out');
    }
    throw error;
  }
}

// Process and format the API response into tasks
function processApiResponse(responseText, projectName, corsHeaders) {
  console.log(`Processing response: ${responseText.length} characters`);
  
  // Parse the JSON response
  let tasks;
  try {
    // First try to parse directly
    try {
      tasks = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON by looking for array brackets
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      console.error('API response is not an array:', tasks);
      tasks = []; // Default to empty array if not array
    }
  } catch (error) {
    console.error('Error parsing API response as JSON:', error);
    console.log('Raw response:', responseText);
    throw new Error('Failed to parse tasks from API response');
  }
  
  // Add project name to tasks if provided and not already set
  if (projectName) {
    tasks = tasks.map(task => ({
      ...task,
      project: task.project || projectName
    }));
  }
  
  // Add id field to each task and map response fields to Task interface fields
  const processedTasks = tasks.map(task => ({
    id: crypto.randomUUID(),
    title: task.title || '',
    description: task.description || '',
    dueDate: task.due_date || null,
    priority: task.priority || null,
    status: task.status || 'todo',
    assignee: task.assignee || null,
    workspace_id: null,
    isRecurring: false,
    frequency: null,
    project: task.project || projectName || null,
  }));
  
  console.log(`Successfully extracted ${processedTasks.length} tasks`);
  
  return new Response(
    JSON.stringify({ tasks: processedTasks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
