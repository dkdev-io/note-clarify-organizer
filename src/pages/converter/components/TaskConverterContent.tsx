
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import NotesInputCard from './NotesInputCard';
import TaskExtractionResults from './TaskExtractionResults';
import { useToast } from '@/hooks/use-toast';
import { parseTextIntoTasks } from '@/utils/task-parser';
import { Task } from '@/utils/task-parser/types';

// Import these to ensure they're available
import '../../../utils/create-llm-issue-report';
import '../../../utils/create-project-issue-report';
import '../../../utils/create-time-estimation-issue-report';

interface TaskConverterContentProps {
  onParseText?: (text: string, projectName: string | null) => void;
}

const TaskConverterContent: React.FC<TaskConverterContentProps> = ({ onParseText }) => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [textAreaValue, setTextAreaValue] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionFailed, setExtractionFailed] = useState(false);

  const handleTextSubmit = async () => {
    if (!textAreaValue || textAreaValue.trim() === '') {
      toast({
        title: "Empty notes",
        description: "Please enter some notes to extract tasks from.",
        variant: "destructive"
      });
      return;
    }

    if (onParseText) {
      // Use parent's parse function (in converter page)
      onParseText(textAreaValue, null);
    } else {
      // Fallback to local parsing (in standalone mode)
      setIsProcessing(true);
      setExtractionFailed(false);
      
      try {
        const tasks = parseTextIntoTasks(textAreaValue);
        if (tasks.length === 0) {
          setExtractionFailed(true);
          toast({
            title: "No tasks found",
            description: "Couldn't extract any tasks from your notes. Try adding more detailed text.",
            variant: "destructive"
          });
        } else {
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
    }
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
    // This is disabled in converter mode
    toast({
      title: "Not available in converter mode",
      description: "This feature is only available in standalone mode.",
      variant: "destructive"
    });
  };

  const handleRetry = () => {
    setExtractionFailed(false);
    setExtractedTasks([]);
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

  return (
    <div className="container mx-auto py-6 space-y-8">
      <NotesInputCard
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        handleTextSubmit={handleTextSubmit}
        addSampleTasks={addSampleTasks}
        isProcessing={isProcessing}
        createAllIssueReports={createAllIssueReports}
      />

      <TaskExtractionResults
        extractedTasks={extractedTasks}
        extractionFailed={extractionFailed}
        isProcessing={isProcessing}
        forceAddToIssueLog={forceAddToIssueLog}
        handleRetry={handleRetry}
      />
    </div>
  );
};

export default TaskConverterContent;
