
/**
 * Utilities for extracting recurring task information from text
 */

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
