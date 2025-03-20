
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheetIcon } from 'lucide-react';
import { downloadTasksAsCSV } from '@/utils/task-parser/export';

interface ExtractedTasksCardProps {
  extractedTasks: Task[];
  isProcessing: boolean;
  forceAddToIssueLog: () => Promise<void>;
}

const ExtractedTasksCard: React.FC<ExtractedTasksCardProps> = ({
  extractedTasks,
  isProcessing,
  forceAddToIssueLog
}) => {
  const handleDownloadCSV = () => {
    const filename = `projectize-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTasksAsCSV(extractedTasks, filename);
  };

  return (
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
      <CardFooter className="flex gap-2">
        <Button 
          onClick={forceAddToIssueLog}
          disabled={isProcessing}
          variant="secondary"
        >
          Force Add to Issue Log
        </Button>
        <Button
          onClick={handleDownloadCSV}
          disabled={isProcessing || extractedTasks.length === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileSpreadsheetIcon className="h-4 w-4" />
          Download as Spreadsheet
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractedTasksCard;
