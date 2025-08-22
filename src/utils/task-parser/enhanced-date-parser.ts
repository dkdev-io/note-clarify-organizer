/**
 * Enhanced date parsing utilities for better natural language understanding
 */

export const parseNaturalLanguageDate = (text: string): string | null => {
  const baseDate = new Date();
  const normalizedText = text.toLowerCase();
  
  console.log("Enhanced date parser called with:", text);
  
  // Check for ordinal dates FIRST (22nd, 23rd, 1st, 234rd -> 23rd, etc.)
  const ordinalPattern = /\b(\d{1,3})(?:st|nd|rd|th)\b/i;
  const ordinalMatch = text.match(ordinalPattern);
  if (ordinalMatch) {
    let day = parseInt(ordinalMatch[1], 10);
    
    // Handle typos like "234rd" -> assume they meant "23rd"
    if (day > 31) {
      // Try to extract the last 2 digits for reasonable dates
      const dayStr = day.toString();
      if (dayStr.length === 3) {
        const lastTwo = parseInt(dayStr.slice(-2), 10);
        if (lastTwo >= 1 && lastTwo <= 31) {
          day = lastTwo;
          console.log(`Date parser: Converting ${ordinalMatch[1]} to ${day}`);
        }
      }
    }
    if (day >= 1 && day <= 31) {
      const targetDate = new Date(baseDate);
      
      // Check if a month is mentioned nearby
      const monthPattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
      const monthMatch = text.match(monthPattern);
      
      if (monthMatch) {
        // Month is specified, use it
        const monthNames = {
          'january': 0, 'jan': 0,
          'february': 1, 'feb': 1,
          'march': 2, 'mar': 2,
          'april': 3, 'apr': 3,
          'may': 4,
          'june': 5, 'jun': 5,
          'july': 6, 'jul': 6,
          'august': 7, 'aug': 7,
          'september': 8, 'sep': 8,
          'october': 9, 'oct': 9,
          'november': 10, 'nov': 10,
          'december': 11, 'dec': 11
        };
        const monthIndex = monthNames[monthMatch[1].toLowerCase()];
        targetDate.setMonth(monthIndex);
        targetDate.setDate(day);
        
        // If the date is in the past, assume next year
        if (targetDate < baseDate) {
          targetDate.setFullYear(targetDate.getFullYear() + 1);
        }
      } else {
        // No month specified, assume current month
        targetDate.setDate(day);
        
        // If the date is in the past this month, assume next month
        if (targetDate < baseDate) {
          targetDate.setMonth(targetDate.getMonth() + 1);
          targetDate.setDate(day);
        }
      }
      
      console.log("Ordinal date pattern matched:", ordinalMatch[0], "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Week-based patterns
  const weekPatterns = [
    { pattern: /\b(?:finish|due|complete|by|before)\s+(?:by\s+)?next\s+week\b/i, addWeeks: 1, endOfWeek: true },
    { pattern: /\b(?:finish|due|complete)\s+(?:in|within)\s+(?:a|one|1)\s+week\b/i, addWeeks: 1 },
    { pattern: /\b(?:finish|due|complete)\s+(?:in|within)\s+(\d+|two|three|four)\s+weeks?\b/i, addWeeks: 'extract' },
    { pattern: /\bin\s+(?:a|one|1)\s+week\b/i, addWeeks: 1 },
    { pattern: /\bthis\s+week\b/i, addWeeks: 0, endOfWeek: true },
    { pattern: /\bend\s+of\s+(?:the\s+)?week\b/i, addWeeks: 0, endOfWeek: true },
    { pattern: /\bweek\s+from\s+(?:today|now)\b/i, addWeeks: 1 },
  ];
  
  // Month-based patterns
  const monthPatterns = [
    { pattern: /\b(?:finish|due|complete|by|before)\s+(?:by\s+)?next\s+month\b/i, addMonths: 1, endOfMonth: true },
    { pattern: /\b(?:finish|due|complete)\s+(?:in|within)\s+(?:a|one|1)\s+month\b/i, addMonths: 1 },
    { pattern: /\b(?:finish|due|complete)\s+(?:in|within)\s+(\d+|two|three|four|five|six)\s+months?\b/i, addMonths: 'extract' },
    { pattern: /\bin\s+(?:a|one|1)\s+month\b/i, addMonths: 1 },
    { pattern: /\bthis\s+month\b/i, addMonths: 0, endOfMonth: true },
    { pattern: /\bend\s+of\s+(?:the\s+)?month\b/i, addMonths: 0, endOfMonth: true },
    { pattern: /\bmonth\s+from\s+(?:today|now)\b/i, addMonths: 1 },
  ];
  
  // Specific day of week patterns with better handling
  const dayOfWeekPatterns = [
    // "before/by/until Saturday" patterns - MUST come first for priority
    { pattern: /\b(?:by|before|until|till)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'before' },
    // "finish/complete/due [by] Saturday" patterns
    { pattern: /\b(?:finish|due|complete|submit|deliver)\s+(?:by\s+)?(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'deadline' },
    // Standard patterns with this/next modifiers
    { pattern: /\b(?:this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'specific' },
    { pattern: /\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'next' },
    // Just the day name alone or with time of day
    { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:morning|afternoon|evening|night))?\b/i, type: 'next' },
  ];
  
  // Time-based patterns (hours)
  const hourPatterns = [
    { pattern: /\b(?:finish|due|complete)\s+(?:in|within)\s+(\d+|twenty-four|forty-eight|seventy-two)\s+hours?\b/i, type: 'hours' },
    { pattern: /\b(\d+|twenty-four|forty-eight|seventy-two)\s+hours?\s+(?:from\s+now|deadline)\b/i, type: 'hours' },
    { pattern: /\bwithin\s+(\d+|twenty-four|forty-eight|seventy-two)\s+hours?\b/i, type: 'hours' },
  ];
  
  // Relative day patterns
  const relativeDayPatterns = [
    { pattern: /\btomorrow\b/i, addDays: 1 },
    { pattern: /\bday\s+after\s+tomorrow\b/i, addDays: 2 },
    { pattern: /\btoday\b/i, addDays: 0 },
    { pattern: /\btonight\b/i, addDays: 0 },
    { pattern: /\bthis\s+evening\b/i, addDays: 0 },
    { pattern: /\btomorrow\s+(?:morning|afternoon|evening|night)\b/i, addDays: 1 },
  ];
  
  // Special patterns like "end of day", "EOD", "COB"
  const specialPatterns = [
    { pattern: /\b(?:eod|end\s+of\s+day)\b/i, addDays: 0, endOfDay: true },
    { pattern: /\b(?:cob|close\s+of\s+business)\b/i, addDays: 0, endOfDay: true },
    { pattern: /\b(?:eow|end\s+of\s+week)\b/i, addWeeks: 0, endOfWeek: true },
    { pattern: /\b(?:eom|end\s+of\s+month)\b/i, addMonths: 0, endOfMonth: true },
  ];
  
  // Number word mapping
  const numberWords: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'twenty': 20, 'thirty': 30,
    'twenty-four': 24, 'forty-eight': 48, 'seventy-two': 72
  };
  
  // Check week patterns
  for (const { pattern, addWeeks, endOfWeek } of weekPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const targetDate = new Date(baseDate);
      let weeksToAdd = 0;
      
      if (addWeeks === 'extract') {
        const numMatch = match[1];
        weeksToAdd = numberWords[numMatch] || parseInt(numMatch, 10);
      } else if (typeof addWeeks === 'number') {
        weeksToAdd = addWeeks;
      }
      
      targetDate.setDate(targetDate.getDate() + (weeksToAdd * 7));
      
      if (endOfWeek) {
        // Set to Friday (end of work week)
        const dayOfWeek = targetDate.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        targetDate.setDate(targetDate.getDate() + daysUntilFriday);
      }
      
      console.log("Week pattern matched:", pattern, "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Check month patterns
  for (const { pattern, addMonths, endOfMonth } of monthPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const targetDate = new Date(baseDate);
      let monthsToAdd = 0;
      
      if (addMonths === 'extract') {
        const numMatch = match[1];
        monthsToAdd = numberWords[numMatch] || parseInt(numMatch, 10);
      } else if (typeof addMonths === 'number') {
        monthsToAdd = addMonths;
      }
      
      targetDate.setMonth(targetDate.getMonth() + monthsToAdd);
      
      if (endOfMonth) {
        // Set to last day of the month
        targetDate.setMonth(targetDate.getMonth() + 1);
        targetDate.setDate(0);
      }
      
      console.log("Month pattern matched:", pattern, "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Check day of week patterns
  for (const { pattern, type } of dayOfWeekPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const dayName = match[1].toLowerCase();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayName);
      const currentDayIndex = baseDate.getDay();
      
      const targetDate = new Date(baseDate);
      let daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
      
      // Handle different pattern types
      if (type === 'before' || type === 'deadline') {
        // For "before/by Saturday", get the next occurrence of that day
        if (daysToAdd === 0) {
          daysToAdd = 7; // If today is Saturday and they say "by Saturday", assume next Saturday
        }
      } else if (type === 'specific') {
        // Handle "next" vs "this"
        if (normalizedText.includes('next')) {
          daysToAdd += 7;
        } else if (normalizedText.includes('this') && daysToAdd === 0) {
          // "this Saturday" when today is Saturday means today
          daysToAdd = 0;
        }
      } else if (type === 'next') {
        // Just the day name - assume next occurrence
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }
      }
      
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      console.log("Day of week pattern matched:", dayName, "Type:", type, "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Check hour patterns
  for (const { pattern, type } of hourPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numMatch = match[1];
      const hours = numberWords[numMatch] || parseInt(numMatch, 10);
      
      if (!isNaN(hours)) {
        const targetDate = new Date(baseDate);
        targetDate.setHours(targetDate.getHours() + hours);
        console.log("Hour pattern matched:", hours, "hours, Result:", targetDate.toISOString().split('T')[0]);
        return targetDate.toISOString().split('T')[0];
      }
    }
  }
  
  // Check relative day patterns
  for (const { pattern, addDays } of relativeDayPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + addDays);
      console.log("Relative day pattern matched:", pattern, "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Check special patterns
  for (const { pattern, addDays, addWeeks, addMonths, endOfDay, endOfWeek, endOfMonth } of specialPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const targetDate = new Date(baseDate);
      
      if (typeof addDays === 'number') {
        targetDate.setDate(targetDate.getDate() + addDays);
      }
      if (typeof addWeeks === 'number') {
        targetDate.setDate(targetDate.getDate() + (addWeeks * 7));
      }
      if (typeof addMonths === 'number') {
        targetDate.setMonth(targetDate.getMonth() + addMonths);
      }
      
      if (endOfDay) {
        targetDate.setHours(23, 59, 59, 999);
      }
      if (endOfWeek) {
        const dayOfWeek = targetDate.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        targetDate.setDate(targetDate.getDate() + daysUntilFriday);
      }
      if (endOfMonth) {
        targetDate.setMonth(targetDate.getMonth() + 1);
        targetDate.setDate(0);
      }
      
      console.log("Special pattern matched:", pattern, "Result:", targetDate.toISOString().split('T')[0]);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // If no enhanced patterns matched, fall back to the original parser
  return null;
};

// Export a combined parser that tries enhanced first, then falls back
export const parseDate = (text: string, fallbackParser?: (text: string) => string | null): string | null => {
  // Try enhanced parser first
  const enhancedResult = parseNaturalLanguageDate(text);
  if (enhancedResult) {
    return enhancedResult;
  }
  
  // Fall back to original parser if provided
  if (fallbackParser) {
    return fallbackParser(text);
  }
  
  return null;
};