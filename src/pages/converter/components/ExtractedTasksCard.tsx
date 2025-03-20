
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheetIcon, CalendarIcon, Clock3Icon, TagIcon } from 'lucide-react';
import { downloadTasksAsCSV } from '@/utils/task-parser/export';
import { Badge } from '@/components/ui/badge';

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
              {/* Time information */}
              {task.duration && 
                <Badge variant="outline" className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border-teal-200">
                  <Clock3Icon size={12} />
                  {task.duration}
                </Badge>
              }
              
              {/* Dates */}
              {task.startDate && 
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Start: {new Date(task.startDate).toLocaleDateString()}
                </Badge>
              }
              {task.dueDate && 
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {task.hardDeadline && " (Hard)"}
                </Badge>
              }
              
              {/* Priority */}
              {task.priority && 
                <Badge variant="outline" className={`text-xs ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : task.priority === 'medium' 
                      ? 'bg-orange-100 text-orange-800 border-orange-200' 
                      : 'bg-green-100 text-green-800 border-green-200'
                }`}>
                  Priority: {task.priority}
                </Badge>
              }
              
              {/* Assignee */}
              {task.assignee && 
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                  Assignee: {task.assignee}
                </Badge>
              }
              
              {/* Folder */}
              {task.folder && 
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                  Folder: {task.folder}
                </Badge>
              }
              
              {/* Labels */}
              {task.labels && task.labels.length > 0 && task.labels.map((label, i) => (
                <Badge key={i} variant="outline" className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  <TagIcon size={10} />
                  {label}
                </Badge>
              ))}
              
              {/* Status badges */}
              {task.autoScheduled && 
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Auto-scheduled
                </Badge>
              }
              {task.isPending && 
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Pending
                </Badge>
              }
              {task.schedule && 
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                  {task.schedule}
                </Badge>
              }
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
