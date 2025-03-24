
import React from 'react';
import { useParams } from 'react-router-dom';
import TaskExtractionFailed from '@/components/task-review/TaskExtractionFailed';
import NotesInputCard from './NotesInputCard';
import ExtractedTasksCard from './ExtractedTasksCard';
import IssueLogCard from './IssueLogCard';
import { useTaskExtraction } from '@/hooks/useTaskExtraction';
import { useToast } from '@/hooks/use-toast';

// Import these to ensure they're available
import '../../../utils/create-llm-issue-report';
import '../../../utils/create-project-issue-report';
import '../../../utils/create-time-estimation-issue-report';

const TaskConverterContent = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const {
    extractedTasks,
    isProcessing,
    extractionFailed,
    textAreaValue,
    setTextAreaValue,
    handleTextSubmit,
    addSampleTasks,
    forceAddToIssueLog,
    handleRetry
  } = useTaskExtraction();

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

      {extractionFailed ? (
        <TaskExtractionFailed 
          onBack={handleRetry} 
        />
      ) : extractedTasks.length > 0 && (
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
