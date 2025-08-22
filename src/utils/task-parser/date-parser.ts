
/**
 * Date parsing utilities for extracting due dates from text
 */

import { parseNaturalLanguageDate } from './enhanced-date-parser';

export const extractDate = (text: string): string | null => {
  // Try enhanced parser first for better natural language understanding
  const enhancedResult = parseNaturalLanguageDate(text);
  if (enhancedResult) {
    console.log("Enhanced parser found date:", enhancedResult, "from text:", text);
    return enhancedResult;
  }
  
  // Define a fixed date for relative date calculations if needed
  const baseDate = new Date(); // Use current date instead of fixed date
  
  console.log("extractDate fallback parser called with text:", text);
  
  // Hour-based deadline patterns
  const hourBasedPatterns = [
    // "within X hours", "in X hours", "X hour turnaround", etc.
    /\b(?:within|in)\s+(\d+)\s+hours?\b/i,
    /\b(\d+)\s+hours?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(\d+)\s+hours?\b/i,
    /\bdue\s+in\s+(\d+)\s+hours?\b/i,
    /\bcomplete\s+(?:within|in)\s+(\d+)\s+hours?\b/i,
    /\bwithin\s+(\d+)\s+hours?\b/i,  // Added explicit pattern for "within X hours"
    /\b24\s+hours\b/i,  // Added pattern for "24 hours"
    /\bone day\b/i      // Added pattern for "one day" as 24 hours
  ];
  
  // Day-based deadline patterns with words like "two" instead of "2"
  const dayBasedPatterns = [
    // "within X days", "in X days", "X day turnaround", etc.
    /\b(?:within|in)\s+(\d+)\s+days?\b/i,
    /\b(\d+)\s+days?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(\d+)\s+days?\b/i,
    /\bdue\s+in\s+(\d+)\s+days?\b/i,
    /\bcomplete\s+(?:within|in)\s+(\d+)\s+days?\b/i,
    /\bwithin\s+(\d+)\s+days?\b/i,  // Added explicit pattern for "within X days"
    
    // Patterns with written numbers
    /\b(?:within|in)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\s+(?:turnaround|deadline|timeframe)\b/i,
    /\bturnaround\s+(?:time|of)?\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bdue\s+in\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bcomplete\s+(?:within|in)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i,
    /\bwithin\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b/i
  ];
  
  // Check for hour-based deadlines first
  for (const pattern of hourBasedPatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log("Hour-based pattern matched:", pattern, "in text:", text);
      let hours = 24; // Default for "24 hours" or "one day"
      
      if (match[1]) {
        hours = parseInt(match[1], 10);
      }
      
      if (!isNaN(hours)) {
        const deadline = new Date(baseDate);
        deadline.setHours(deadline.getHours() + hours);
        const result = deadline.toISOString().split('T')[0];
        console.log("Extracted hour-based deadline:", result);
        return result;
      }
    }
  }
  
  // Check for day-based deadlines
  for (const pattern of dayBasedPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      console.log("Day-based pattern matched:", pattern, "in text:", text);
      let days;
      
      // Convert written numbers to digits
      if (isNaN(parseInt(match[1], 10))) {
        const numberMapping: Record<string, number> = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        days = numberMapping[match[1].toLowerCase()];
      } else {
        days = parseInt(match[1], 10);
      }
      
      if (!isNaN(days)) {
        const deadline = new Date(baseDate);
        deadline.setDate(deadline.getDate() + days);
        const result = deadline.toISOString().split('T')[0];
        console.log("Extracted day-based deadline:", result);
        return result;
      }
    }
  }

  // Expanded date patterns recognition
  const datePatterns = [
    // Format: Ordinal dates (22nd, 23rd, 1st, 2nd, etc.) - this should come first for priority
    /\b(\d{1,2})(?:st|nd|rd|th)\b/i,
    
    // Format: by/due/on/for month day, year
    /(?:by|due|on|for|deadline|before)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i,
    
    // Format: by/due/on/for MM/DD/YYYY or MM-DD-YYYY
    /(?:by|due|on|for|deadline|before)\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    
    // Format: MM/DD/YYYY or MM-DD-YYYY without by/due prefix
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/i,
    
    // Format: Month Day format with or without year
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i,
    
    // Format: Day of week (next Monday, this Friday, after Saturday)
    /(?:(?:this|next|after)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
    
    // Format: Relative dates (tomorrow, next week)
    /\b(?:tomorrow|today|next week)\b/i
  ];
  
  // Try each pattern
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Handle different date formats
      try {
        // MM/DD/YYYY or MM-DD-YYYY format
        if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(match[0])) {
          const parts = match[0].split(/[\/\-]/);
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        // Month name format
        else if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(match[0])) {
          let monthStr, dayStr, yearStr;
          
          if (match[0].match(/(?:by|due|on|for|deadline|before)/i)) {
            // Using named capture groups format
            monthStr = match[1];
            dayStr = match[2];
            yearStr = match[3] || baseDate.getFullYear().toString();
          } else {
            // Direct month name format
            monthStr = match[1];
            dayStr = match[2];
            yearStr = match[3] || baseDate.getFullYear().toString();
          }
          
          const date = new Date(`${monthStr} ${dayStr}, ${yearStr}`);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        // Ordinal dates (22nd, 23rd, etc.) - assume current month if no month specified
        else if (/^\d{1,2}(?:st|nd|rd|th)$/.test(match[0])) {
          const day = parseInt(match[1], 10);
          
          if (day >= 1 && day <= 31) {
            const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
            
            // If the date is in the past, assume next month
            if (date < baseDate) {
              date.setMonth(date.getMonth() + 1);
            }
            
            console.log("Extracted ordinal date:", date.toISOString().split('T')[0]);
            return date.toISOString().split('T')[0];
          }
        }
        // Relative dates
        else if (/(?:this|next|tomorrow|today)/i.test(match[0])) {
          let resultDate = new Date(baseDate);
          
          if (/tomorrow/i.test(match[0])) {
            resultDate.setDate(baseDate.getDate() + 1);
          } else if (/next week/i.test(match[0])) {
            resultDate.setDate(baseDate.getDate() + 7);
         } else if (/this|next|after/i.test(match[0]) && /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(match[0])) {
            const dayOfWeekMatch = match[0].match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dayOfWeekMatch) {
              const dayOfWeek = dayOfWeekMatch[1].toLowerCase();
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const targetDay = daysOfWeek.indexOf(dayOfWeek);
              
              let daysToAdd = (targetDay - baseDate.getDay() + 7) % 7;
              if (/next/i.test(match[0])) {
                daysToAdd += 7;
              } else if (/after/i.test(match[0])) {
                // "after Saturday" means the very next Saturday
                if (daysToAdd === 0) {
                  daysToAdd = 7; // If today is the target day, go to next occurrence
                }
              } else if (daysToAdd === 0) {
                daysToAdd = 7; // If "this Sunday" and today is Sunday, go to next Sunday
              }
              
              resultDate.setDate(baseDate.getDate() + daysToAdd);
            }
          }
          
          return resultDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
  }
  
  return null;
};
