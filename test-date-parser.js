// Test script for enhanced date parser
// Run with: node test-date-parser.js

import { parseNaturalLanguageDate } from './src/utils/task-parser/enhanced-date-parser.ts';

const testCases = [
  // Day of week tests
  "dan will finish website before saturday",
  "complete project by friday",
  "meeting on tuesday", 
  "deliver by monday",
  "finish before wednesday",
  "due thursday",
  "submit by sunday",
  "this monday",
  "next tuesday",
  
  // Ordinal date tests
  "Dan the app 22nd",
  "Book flights 23rd",
  "Meeting on the 15th",
  "Due on the 31st",
  "Launch on august 22nd",
  "Release september 15th",
  
  // Mixed tests
  "finish by next thursday",
  "complete in two weeks",
  "due end of month",
  "within 24 hours",
  "tomorrow morning",
  "day after tomorrow"
];

console.log("Testing Enhanced Date Parser");
console.log("Today's date:", new Date().toISOString().split('T')[0]);
console.log("============================\n");

testCases.forEach(testCase => {
  const result = parseNaturalLanguageDate(testCase);
  console.log(`Input: "${testCase}"`);
  console.log(`Result: ${result || "NO DATE FOUND"}`);
  console.log("---");
});