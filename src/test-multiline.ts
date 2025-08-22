// Test for multi-line task parsing
import { parseTextIntoTasks } from './utils/task-parser';

const testCases = [
  // Your specific problematic examples
  `Finish presentation before Tuesday`,
  
  `Launch product on the 15th`,
  
  `Meeting
September 3rd`,
  
  `Complete by
next Friday`,
  
  // Additional test cases
  `Dan will finish website
before Saturday`,
  
  `Book flights
23rd`,
  
  `Review documents and send to team
by Monday morning`,
  
  // Single line versions for comparison
  `Meeting September 3rd`,
  `Complete by next Friday`,
  `Dan will finish website before Saturday`,
];

async function runTests() {
  console.log("Testing Multi-line Task Parsing");
  console.log("Today's date:", new Date().toISOString().split('T')[0]);
  console.log("============================\n");
  
  for (const testCase of testCases) {
    console.log(`\nInput:\n"${testCase}"\n`);
    
    const tasks = await parseTextIntoTasks(testCase, 'Test Project');
    
    if (tasks.length === 0) {
      console.log("NO TASKS FOUND");
    } else {
      tasks.forEach((task, index) => {
        console.log(`Task ${index + 1}:`);
        console.log(`  Title: ${task.title}`);
        console.log(`  Due Date: ${task.dueDate || 'None'}`);
        console.log(`  Assignee: ${task.assignee || 'None'}`);
      });
    }
    console.log("---");
  }
}

runTests().catch(console.error);