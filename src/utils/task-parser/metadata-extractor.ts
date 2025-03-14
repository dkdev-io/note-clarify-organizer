
/**
 * Utilities for extracting task metadata like priority, assignee, status, etc.
 */

// Function to extract priority from text
export const extractPriority = (text: string): 'low' | 'medium' | 'high' | null => {
  const lowPriorityRegex = /\b(?:low priority|not urgent|can wait|p3|low importance)\b/i;
  const highPriorityRegex = /\b(?:high priority|urgent|asap|p1|important|critical)\b/i;
  const mediumPriorityRegex = /\b(?:medium priority|moderate|p2|normal priority)\b/i;
  
  if (highPriorityRegex.test(text)) return 'high';
  if (mediumPriorityRegex.test(text)) return 'medium';
  if (lowPriorityRegex.test(text)) return 'low';
  
  return null;
};

// Function to extract assignee from text
export const extractAssignee = (text: string): string | null => {
  // Patterns for different ways to mention assignees
  const assigneePatterns = [
    // "assigned to X", "assignee: X", etc.
    /(?:assigned to|assignee|responsible|owner):\s*([A-Za-z\s]+?)(?:,|\.|$)/i,
    
    // Handle names before conjunctions like "and" or "with" - take only the first name
    /\b([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:and|with|&)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:needs|should|will|to|can|must|has to|is going to|has|is supposed to)\b/i,
    
    // "X needs to", "X should", "X will", etc. - look for person's name followed by action
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:needs|should|will|to|can|must|has to|is going to)\b/i,
    
    // "X is responsible for", "X is going to", etc.
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+is\s+(?:responsible|going|supposed|expected)\b/i,
    
    // "X must finish/do/complete" etc.
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+must\b/i,
    
    // Extra pattern for Jennifer-style names
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s\b/i
  ];
  
  for (const pattern of assigneePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Ensure we're not extracting conjunctions as part of the name
      const nameCandidate = match[1].trim();
      if (!/^(and|with|&)$/i.test(nameCandidate)) {
        return nameCandidate;
      }
    }
  }
  
  return null;
};

// Function to extract status from text
export const extractStatus = (text: string): 'todo' | 'in-progress' | 'done' => {
  const inProgressRegex = /\b(?:in progress|started|working on|ongoing)\b/i;
  const doneRegex = /\b(?:done|completed|finished|closed)\b/i;
  
  if (inProgressRegex.test(text)) return 'in-progress';
  if (doneRegex.test(text)) return 'done';
  
  return 'todo';
};

// Function to check if task is recurring
export const isRecurringTask = (text: string): { isRecurring: boolean, frequency: string | null } => {
  const recurringRegex = /\b(?:recurring|every|each|repeat|weekly|daily|monthly|biweekly)\b/i;
  
  if (recurringRegex.test(text)) {
    // Try to extract frequency information
    const dailyRegex = /\b(?:every day|daily)\b/i;
    const weeklyRegex = /\b(?:every week|weekly)\b/i;
    const biweeklyRegex = /\b(?:every other week|biweekly|bi-weekly)\b/i;
    const monthlyRegex = /\b(?:every month|monthly)\b/i;
    
    if (dailyRegex.test(text)) return { isRecurring: true, frequency: 'daily' };
    if (weeklyRegex.test(text)) return { isRecurring: true, frequency: 'weekly' };
    if (biweeklyRegex.test(text)) return { isRecurring: true, frequency: 'biweekly' };
    if (monthlyRegex.test(text)) return { isRecurring: true, frequency: 'monthly' };
    
    return { isRecurring: true, frequency: null };
  }
  
  return { isRecurring: false, frequency: null };
};

// Function to extract project name from text
export const extractProjectName = (text: string): string | null => {
  if (!text || !text.trim()) return null;
  
  // Split the text into lines for analysis
  const lines = text.split(/\r?\n/);
  const firstLine = lines.length > 0 ? lines[0].trim() : '';
  
  console.log("Extracting project name from:", firstLine);
  
  // First priority - specific pattern for "Here's our plan for the xyz marketing campaign" format
  // Modified pattern to properly capture the content after "for/on/about/regarding"
  const planForPattern = /(?:here(?:'s|\sis|\sare)?\s+(?:our|the|some|my)?\s+(?:plan|notes|agenda|update|overview|summary|ideas|thoughts)\s+(?:for|on|about|regarding)\s+(?:the\s+)?)(.+?)(?:\.|\s*$)/i;
  const planForMatch = firstLine.match(planForPattern);
  
  if (planForMatch && planForMatch[1]) {
    const extractedName = planForMatch[1].trim();
    // Ensure we don't just capture "for the" or similar phrases
    if (extractedName.length > 3 && !extractedName.match(/^(the|our|this|for|about)$/i)) {
      console.log("Extracted project name from 'plan for' pattern:", extractedName);
      return extractedName;
    }
  }
  
  // Check for common project name patterns in the first line
  const projectNamePatterns = [
    // Client/project name at beginning or end of the sentence
    /^([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation)/i,
    /(?:project|campaign|initiative|redesign|launch|implementation)\s+for\s+([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){1,3})/i,
    
    // Phrases with descriptive project names
    /(?:the|our|)\s+([A-Z][a-z0-9]+(?:\s+[a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation)/i,
    
    // Client + project type pattern
    /([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){0,2})\s+(?:client|account)(?:\s+([a-z0-9]+(?:\s+[a-z0-9]+){1,3})\s+(?:project|campaign|initiative|redesign|launch|implementation))?/i,
  ];
  
  // Try specific project name patterns
  for (const pattern of projectNamePatterns) {
    const match = firstLine.match(pattern);
    if (match && match[1]) {
      const projectName = match[1].trim();
      console.log("Extracted specific project name:", projectName);
      return projectName;
    }
  }

  // Check for context clues in the first line
  const contextCluePatterns = [
    // Updated patterns for phrases like "Here's our plan for the website development"
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i,  // "plan for the website development."
    /^(?:.*?)\s+on\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i,   // "working on the website development."
    /^(?:.*?)\s+about\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)(?:\.|\s*$)/i, // "notes about the website development."
    
    // More specific project patterns
    /^(?:.*?)\s+for\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)\s+project\b/i,  // "plan for the marketing project"
    /^(?:.*?)\s+(?:the\s+)?([A-Za-z0-9\s\-_']+?)\s+project\b/i,        // "the marketing project"
    /^([A-Za-z0-9\s\-_']+?)\s+(?:project|plan|initiative)\b/i,         // "Marketing Project" or "Alpha plan"
    
    // Title-like patterns
    /^([A-Za-z0-9\s\-_']+?)(?::\s|\s-\s|\s–\s)/i, // "Project Name: details" or "Website Development - Tasks"
  ];
  
  // Try each context clue pattern
  for (const pattern of contextCluePatterns) {
    const titleMatch = firstLine.match(pattern);
    if (titleMatch && titleMatch[1]) {
      const candidateProject = titleMatch[1].trim();
      
      // Improve filtering of project names
      // 1. Must be longer than 2 characters
      // 2. Shouldn't be just common words or articles
      // 3. Shouldn't be generic terms like "meeting" or "update"
      if (candidateProject.length > 2 && 
          !/^(the|a|an|this|our|it|that|these|those|them|his|her|their|its)$/i.test(candidateProject) &&
          !/^(plan|meeting|discussion|agenda|notes|minutes|summary|team|update|overview|here|our|status|report)$/i.test(candidateProject) &&
          !/^here\'s\s+our/i.test(candidateProject)) {
        
        // Clean up potential project name - remove trailing articles, etc.
        let cleanProject = candidateProject
          .replace(/^(?:the|our|this)\s+/i, '')
          .replace(/\s+(?:update|status|report|notes|meeting)$/i, '');
        
        console.log("Extracted project name from context clue pattern:", cleanProject);
        return cleanProject;
      }
    }
  }
  
  // If we couldn't extract a project name from the text, use a default
  console.log("Could not extract project name, using default");
  return null;
};
