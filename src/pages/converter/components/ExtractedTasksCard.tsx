
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  );
};

export default ExtractedTasksCard;
