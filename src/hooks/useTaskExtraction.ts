import { useState } from 'react';
import { Task } from '@/utils/task-parser/types';
import { useToast } from '@/hooks/use-toast';
import { 
  extractTasksFromText, 
  addTasksToIssueLog,
  getTasksWithRecommendations 
} from '../pages/converter/services/TaskConverterService';

export function useTaskExtraction() {
  const [noteText, setNoteText] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractionFailed, setExtractionFailed] = useState<boolean>(false);
  const [textAreaValue, setTextAreaValue] = useState('');
  const { toast } = useToast();

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
    setExtractionFailed(false);

    try {
      console.log("=== TASK EXTRACTION HOOK DEBUG ===");
      console.log("Input text:", text);
      
      // Extract tasks from the text and store them in Supabase
      const tasks = await extractTasksFromText(text);
      console.log("Tasks returned from extractTasksFromText:", tasks);
      
      if (tasks.length === 0) {
        console.log("No tasks found, setting extraction failed");
        setExtractionFailed(true);
        toast({
          title: "No tasks found",
          description: "Couldn't extract any tasks from your notes. Try adding more detailed text.",
          variant: "destructive"
        });
      } else {
        console.log("Tasks found, setting extracted tasks");
        setExtractedTasks(tasks);
        
        toast({
          title: "Tasks extracted",
          description: `Successfully extracted ${tasks.length} tasks from your notes.`,
        });
      }
    } catch (error) {
      console.error('Error extracting tasks:', error);
      setExtractionFailed(true);
      toast({
        title: "Error extracting tasks",
        description: "There was a problem processing your notes. Please try again.",
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

  const handleRetry = () => {
    setExtractionFailed(false);
  };

  return {
    noteText,
    extractedTasks,
    isProcessing,
    extractionFailed,
    textAreaValue,
    setTextAreaValue,
    handleTextSubmit,
    addSampleTasks,
    forceAddToIssueLog,
    handleAddToIssueLog,
    handleRetry
  };
}
