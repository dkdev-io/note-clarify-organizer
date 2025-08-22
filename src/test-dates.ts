// Quick test for date parsing
import { parseNaturalLanguageDate } from './utils/task-parser/enhanced-date-parser';
import { extractDate } from './utils/task-parser/date-parser';

const testCases = [
  // Your specific examples
  "dan will finish website before saturday",
  "Dan the app 22nd",
  "Book flights 23rd",
  
  // Additional day tests
  "complete project by friday",
  "meeting on tuesday", 
  "deliver by monday",
  "finish before wednesday",
  "due thursday",
  "submit by sunday",
  
  // With modifiers
  "this monday",
  "next tuesday",
  "before next saturday",
  
  // Ordinal with months
  "Launch on august 22nd",
  "Release september 15th",
  "Meeting march 3rd",
  
  // Other patterns
  "finish by next thursday",
  "complete in two weeks",
  "due end of month",
];

console.log("Testing Date Parser");
console.log("Today's date:", new Date().toISOString().split('T')[0]);
console.log("Day of week:", ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]);
console.log("============================\n");

testCases.forEach(testCase => {
  // Test both parsers
  const enhancedResult = parseNaturalLanguageDate(testCase);
  const fullResult = extractDate(testCase);
  
  console.log(`Input: "${testCase}"`);
  console.log(`Enhanced Parser: ${enhancedResult || "NO DATE"}`);
  console.log(`Full Parser: ${fullResult || "NO DATE"}`);
  console.log("---");
});

// Export for testing
export { testCases };