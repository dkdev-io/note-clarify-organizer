
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '@/utils/task-parser/types';
import { useToast } from '@/hooks/use-toast';
import NotesInputCard from './NotesInputCard';
import ExtractedTasksCard from './ExtractedTasksCard';
import IssueLogCard from './IssueLogCard';
import { 
  extractTasksFromText, 
  addTasksToIssueLog, 
  addDirectTestIssue 
} from '../services/TaskConverterService';
import '../../../utils/create-llm-issue-report';
import '../../../utils/create-project-issue-report';
import '../../../utils/create-time-estimation-issue-report';

const TaskConverterContent = () => {
  const [noteText, setNoteText] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [textAreaValue, setTextAreaValue] = useState('');

  const handleAddDirectTestIssue = async () => {
    const success = await addDirectTestIssue();
    if (success) {
      toast({
        title: "Test issue created",
        description: "Successfully added a test issue directly to the database.",
      });
    } else {
      toast({
        title: "Error creating test issue",
        description: "Failed to add test issue directly to the database.",
        variant: "destructive"
      });
    }
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
      const tasks = extractTasksFromText(text);
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

    const result = await addTasksToIssueLog(tasks);
    
    toast({
      title: "Tasks added to issue log",
      description: `Successfully added ${result.successful} out of ${result.totalTasks} tasks to the issue log.`,
      variant: result.failed > 0 ? "destructive" : "default"
    });
    
    return result;
  };

  const createAllIssueReports = async () => {
    try {
      await import('../../../utils/create-llm-issue-report');
      await import('../../../utils/create-project-issue-report');
      await import('../../../utils/create-time-estimation-issue-report');
      
      toast({
        title: "Issue reports created",
        description: "Successfully created diagnostic issue reports.",
      });
    } catch (error) {
      console.error("Error creating issue reports:", error);
      toast({
        title: "Error creating issue reports",
        description: "Failed to create diagnostic issue reports.",
        variant: "destructive"
      });
    }
  };

  const handleTextSubmit = async () => {
    await handleExtractTasks(textAreaValue);
  };

  const addSampleTasks = () => {
    const sampleText = `Here are some tasks:
    - Fix the login page bug by tomorrow (high priority)
    - Create a new feature for the dashboard
    - Research API integration options
    - Update documentation with new changes
    - Schedule team meeting for next week`;
    
    setTextAreaValue(sampleText);
  };

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
      <NotesInputCard
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        handleTextSubmit={handleTextSubmit}
        addSampleTasks={addSampleTasks}
        isProcessing={isProcessing}
        addDirectTestIssue={handleAddDirectTestIssue}
        createAllIssueReports={createAllIssueReports}
      />

      {extractedTasks.length > 0 && (
        <div className="space-y-6">
          <ExtractedTasksCard
            extractedTasks={extractedTasks}
            isProcessing={isProcessing}
            forceAddToIssueLog={forceAddToIssueLog}
          />

          <IssueLogCard extractedTasks={extractedTasks} />
        </div>
      )}
    </div>
  );
};

export default TaskConverterContent;
