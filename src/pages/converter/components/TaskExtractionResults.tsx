
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import TaskExtractionFailed from '@/components/task-review/TaskExtractionFailed';
import ExtractedTasksCard from './ExtractedTasksCard';
import IssueLogCard from './IssueLogCard';

interface TaskExtractionResultsProps {
  extractedTasks: Task[];
  extractionFailed: boolean;
  isProcessing: boolean;
  forceAddToIssueLog: () => Promise<void>;
  handleRetry: () => void;
}

const TaskExtractionResults: React.FC<TaskExtractionResultsProps> = ({
  extractedTasks,
  extractionFailed,
  isProcessing,
  forceAddToIssueLog,
  handleRetry
}) => {
  // Log tasks to debug
  React.useEffect(() => {
    console.log('TaskExtractionResults received tasks:', extractedTasks);
  }, [extractedTasks]);

  if (extractionFailed) {
    return (
      <TaskExtractionFailed 
        onBack={handleRetry} 
      />
    );
  }
  
  // Make sure extractedTasks is an array and has items
  if (extractedTasks && extractedTasks.length > 0) {
    return (
      <div className="space-y-6">
        <ExtractedTasksCard
          extractedTasks={extractedTasks}
          isProcessing={isProcessing}
          forceAddToIssueLog={forceAddToIssueLog}
        />
        
        <IssueLogCard extractedTasks={extractedTasks} />
      </div>
    );
  }
  
  return null;
};

export default TaskExtractionResults;
