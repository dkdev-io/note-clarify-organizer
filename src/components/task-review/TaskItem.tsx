
import React from 'react';
import { Task } from '@/utils/parser';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CalendarIcon, User2Icon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { formatDate } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-green-100 text-green-800 border-green-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const priorityColor = task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : priorityColors.normal;
  
  return (
    <div className="py-4 group border-b border-gray-100 last:border-none">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox className="mt-1" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-gray-900 break-words pr-2">{task.title}</h3>
              
              {task.description && (
                <p className="text-sm text-gray-500 mt-1 break-words">
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {task.priority && (
                  <Badge variant="outline" className={`${priorityColor} capitalize`}>
                    {task.priority}
                  </Badge>
                )}
                
                {task.assignee !== null && task.assignee !== undefined && task.assignee !== '' ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User2Icon className="h-3 w-3" />
                    {task.assignee}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-gray-500">
                    <User2Icon className="h-3 w-3" />
                    Not Assigned
                  </Badge>
                )}
                
                {task.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700">
                    <CalendarIcon className="h-3 w-3" />
                    {formatDate(new Date(task.dueDate), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-gray-700 rounded-full"
                onClick={() => onEdit(task.id)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-red-600 rounded-full"
                onClick={() => onDelete(task.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
