import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { useToast } from '@/hooks/use-toast';
import TaskToIssueConverter from '@/components/task-review/TaskToIssueConverter';
import { addTasksToIssueLogs } from '@/utils/task-to-issue-converter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { issueService } from '@/services/issueService';
import { IssueFormData } from '@/types/issue';

const TaskConverterContent = () => {
  const [noteText, setNoteText] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  // Force add a direct issue for testing
  const addDirectTestIssue = async () => {
    const testIssue: IssueFormData = {
      title: "Test Issue - Direct Addition",
      description: "This is a test issue added directly to verify the issue service is working.",
      status: 'open',
      priority: 'medium',
      created_by: 'Test User',
      assigned_to: 'Test User'
    };
    
    console.log("💡 Adding direct test issue:", testIssue);
    try {
      const result = await issueService.createIssue(testIssue);
      console.log("✅ Direct test issue result:", result);
      toast({
        title: "Test issue created",
        description: "Successfully added a test issue directly to the database.",
      });
    } catch (error) {
      console.error("❌ Error adding direct test issue:", error);
      toast({
        title: "Error creating test issue",
        description: "Failed to add test issue directly to the database.",
        variant: "destructive"
      });
    }
  };

  // Check if text contains a command to add tasks to issue log
  const checkForIssueLogCommand = (text: string): boolean => {
    const issueLogCommands = [
      /add to issue log/i,
      /add to issues/i,
      /add to the issue log/i,
      /log as issues?/i,
      /create issues?/i,
      /add tasks? to issue log/i,
      /add to error log/i,
      /add them now/i,
      /add to log/i,
      /log now/i,
      /add all/i,
      /add tasks now/i,
      /convert to issue/i,
      /save as issue/i,
      /track as issue/i,
      /record issue/i
    ];
    
    return issueLogCommands.some(regex => regex.test(text));
  };

  const handleExtractTasks = async (text: string) => {
    if (!text || text.trim() === '') {
      toast({
        title: "Empty notes",
        description: "Please enter some notes to extract tasks from.",
        variant: "destructive"
      });
      return;
    }

    setNoteText(text);
    setIsProcessing(true);

    try {
      console.log("Extracting tasks from text:", text.substring(0, 100) + "...");
      // Simple parsing for now
      const tasks = parseTextIntoTasks(text);
      console.log("Extracted tasks:", tasks);
      setExtractedTasks(tasks);

      if (tasks.length === 0) {
        toast({
          title: "No tasks found",
          description: "Couldn't extract any tasks from your notes. Try adding more detailed text.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Tasks extracted",
          description: `Successfully extracted ${tasks.length} tasks from your notes.`,
        });
        
        // ALWAYS add to issue log regardless of command detection
        console.log("🔄 Adding extracted tasks to issue log immediately:", tasks);
        const result = await handleAddToIssueLog(tasks);
        console.log("✅ Result of adding to issue log:", result);
      }
    } catch (error) {
      console.error('Error extracting tasks:', error);
      toast({
        title: "Error extracting tasks",
        description: "Something went wrong while extracting tasks.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle adding tasks to issue log
  const handleAddToIssueLog = async (tasks: Task[]): Promise<{
    successful: number;
    failed: number;
    totalTasks: number;
  }> => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to convert",
        description: "There are no tasks to add to the issue log.",
        variant: "destructive"
      });
      return { successful: 0, failed: 0, totalTasks: 0 };
    }

    console.log("🚀 Starting to add tasks to issue log:", tasks);
    try {
      const result = await addTasksToIssueLogs(tasks);
      console.log("📊 Result from adding tasks to issue log:", result);
      
      toast({
        title: "Tasks added to issue log",
        description: `Successfully added ${result.successful} out of ${result.totalTasks} tasks to the issue log.`,
        variant: result.failed > 0 ? "destructive" : "default"
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error adding tasks to issue log:', error);
      toast({
        title: "Error adding to issue log",
        description: "Something went wrong while adding tasks to the issue log.",
        variant: "destructive"
      });
      return { successful: 0, failed: 0, totalTasks: tasks.length };
    }
  };

  // Simulate task extraction with textarea and button
  const [textAreaValue, setTextAreaValue] = useState('');

  const handleTextSubmit = async () => {
    await handleExtractTasks(textAreaValue);
  };

  // Add some sample tasks button for testing
  const addSampleTasks = () => {
    const sampleText = `Here are some tasks:
    - Fix the login page bug by tomorrow (high priority)
    - Create a new feature for the dashboard
    - Research API integration options
    - Update documentation with new changes
    - Schedule team meeting for next week`;
    
    setTextAreaValue(sampleText);
  };

  // Force add current tasks to issue log
  const forceAddToIssueLog = async () => {
    if (extractedTasks.length === 0) {
      toast({
        title: "No tasks to add",
        description: "Extract some tasks first before adding to the issue log.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await handleAddToIssueLog(extractedTasks);
      console.log("Force add result:", result);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Task input form */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Enter your notes</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addDirectTestIssue}
              className="text-xs"
            >
              Add Test Issue Directly
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-md min-h-[150px]"
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value)}
            placeholder="Type or paste your notes here..."
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button 
            onClick={handleTextSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Tasks & Add to Issue Log'}
          </Button>
          <Button 
            variant="outline" 
            onClick={addSampleTasks}
            disabled={isProcessing}
          >
            Add Sample Tasks
          </Button>
        </CardFooter>
      </Card>

      {extractedTasks.length > 0 && (
        <div className="space-y-6">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Extracted Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {extractedTasks.map((task, index) => (
                <div key={task.id || index} className="p-4 border rounded-md">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && <p className="text-gray-600 mt-1">{task.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.dueDate && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Due: {task.dueDate}</span>}
                    {task.priority && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Priority: {task.priority}</span>}
                    {task.assignee && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Assignee: {task.assignee}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={forceAddToIssueLog}
                disabled={isProcessing}
                variant="secondary"
              >
                Force Add to Issue Log
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Add to Issue Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskToIssueConverter tasks={extractedTasks} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaskConverterContent;
