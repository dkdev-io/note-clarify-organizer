
import React, { useState } from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircleIcon, ClipboardListIcon } from 'lucide-react';
import TaskSuggestions from '@/components/task-review/TaskSuggestions';

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
  const [editedTasks, setEditedTasks] = useState<Task[]>(extractedTasks);

  // Handle applying a suggestion to a task
  const handleApplySuggestion = (taskId: string, field: string, value: any) => {
    setEditedTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, [field]: value } 
          : task
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardListIcon className="h-5 w-5 mr-2 text-primary" />
          Extracted Tasks ({extractedTasks.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {editedTasks.map(task => (
            <div 
              key={task.id} 
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.dueDate && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                    
                    {task.priority && (
                      <Badge 
                        variant="outline" 
                        className={
                          task.priority === 'high' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : task.priority === 'medium' 
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                              : 'bg-green-50 text-green-700 border-green-200'
                        }
                      >
                        Priority: {task.priority}
                      </Badge>
                    )}
                    
                    {task.assignee && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Assignee: {task.assignee}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {task.suggestions && (
                <TaskSuggestions 
                  task={task} 
                  onApplySuggestion={(field, value) => handleApplySuggestion(task.id, field, value)} 
                />
              )}
            </div>
          ))}
          
          {editedTasks.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No tasks extracted yet. Try adding more text or using different phrasing.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3">
        <Button
          onClick={forceAddToIssueLog}
          disabled={isProcessing || editedTasks.length === 0}
          className="bg-primary text-primary-foreground font-bold"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Add to Issue Log
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractedTasksCard;
