
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/task-parser/types';
import { addTasksToIssueLogs } from '@/utils/task-to-issue-converter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, ClipboardList } from 'lucide-react';

interface TaskToIssueConverterProps {
  tasks: Task[];
}

const TaskToIssueConverter: React.FC<TaskToIssueConverterProps> = ({ tasks }) => {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    successful: number;
    failed: number;
    totalTasks: number;
  } | null>(null);

  const handleConvertToIssues = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to convert",
        description: "Please create some tasks first before converting to issues.",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      const result = await addTasksToIssueLogs(tasks);
      setConversionResult(result);
      
      toast({
        title: "Tasks converted to issues",
        description: `Successfully added ${result.successful} out of ${result.totalTasks} tasks to the issue log.`,
      });
    } catch (error) {
      console.error('Error converting tasks to issues:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your tasks to issues. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4">
      {conversionResult && (
        <Alert variant={conversionResult.failed > 0 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Results</AlertTitle>
          <AlertDescription>
            Successfully added {conversionResult.successful} out of {conversionResult.totalTasks} tasks to the issue log.
            {conversionResult.failed > 0 && (
              <span className="block mt-1 font-semibold">
                {conversionResult.failed} tasks failed to convert.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleConvertToIssues} 
        disabled={isConverting || tasks.length === 0}
        className="w-full"
      >
        {isConverting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
            Converting...
          </>
        ) : (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Add Tasks to Issue Log
          </>
        )}
      </Button>
    </div>
  );
};

export default TaskToIssueConverter;
