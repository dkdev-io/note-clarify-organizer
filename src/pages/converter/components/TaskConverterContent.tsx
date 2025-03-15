
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TaskExtractor from '@/components/TaskExtractor';
import { Task } from '@/utils/task-parser/types';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { useToast } from '@/hooks/use-toast';
import TaskToIssueConverter from '@/components/task-review/TaskToIssueConverter';
import { addTasksToIssueLogs } from '@/utils/task-to-issue-converter';
import { Button } from '@/components/ui/button';

// Removed the React.FC type to avoid conflicts with props
const TaskConverterContent = () => {
  const [noteText, setNoteText] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

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
      /add to log/i
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
      // Simple parsing for now
      const tasks = parseTextIntoTasks(text);
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
        
        // Adding auto-conversion to issue log - always try to add to issue log
        // This ensures that when the user asks to "add to issue log", we do it automatically
        await handleAddToIssueLog(tasks);
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
  const handleAddToIssueLog = async (tasks: Task[]) => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to convert",
        description: "There are no tasks to add to the issue log.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await addTasksToIssueLogs(tasks);
      toast({
        title: "Tasks added to issue log",
        description: `Successfully added ${result.successful} out of ${result.totalTasks} tasks to the issue log.`,
        variant: result.failed > 0 ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Error adding tasks to issue log:', error);
      toast({
        title: "Error adding to issue log",
        description: "Something went wrong while adding tasks to the issue log.",
        variant: "destructive"
      });
    }
  };

  // Simulate task extraction with textarea and button
  const [textAreaValue, setTextAreaValue] = useState('');

  const handleTextSubmit = async () => {
    await handleExtractTasks(textAreaValue);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Simple text input form for task extraction */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Enter your notes</h2>
        <textarea
          className="w-full p-3 border rounded-md min-h-[150px]"
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
          placeholder="Type or paste your notes here..."
        />
        <Button 
          className="mt-4" 
          onClick={handleTextSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Extract Tasks'}
        </Button>
      </div>

      {extractedTasks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Extracted Tasks</h2>
          <div className="space-y-4">
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
          </div>

          <div className="mt-6">
            <TaskToIssueConverter tasks={extractedTasks} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskConverterContent;
