import React from 'react';
import { Task } from '@/utils/task-parser/types';
import TaskExtractionFailed from '@/components/task-review/TaskExtractionFailed';
import ExtractedTasksCard from './ExtractedTasksCard';
import IssueLogCard from './IssueLogCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
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
  if (isProcessing) {
    return <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Processing tasks...</p>
        </CardContent>
      </Card>;
  }
  if (extractionFailed) {
    return <TaskExtractionFailed onBack={handleRetry} />;
  }

  // Make sure extractedTasks is an array and has items
  if (extractedTasks && extractedTasks.length > 0) {
    return <div className="space-y-6">
        <ExtractedTasksCard extractedTasks={extractedTasks} isProcessing={isProcessing} forceAddToIssueLog={forceAddToIssueLog} />
        
        <IssueLogCard extractedTasks={extractedTasks} />
      </div>;
  }

  // Display a message if no tasks were found or being processed
  return <Card className="mb-6">
      
      
    </Card>;
};
export default TaskExtractionResults;