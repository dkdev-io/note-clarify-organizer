
import React from 'react';
import { Task } from '@/utils/parser';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const renderAssigneeBadge = (assignee: string | null | undefined) => {
    if (!assignee || assignee.trim() === '') {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px]">
          Not Assigned
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
        Assignee: {assignee}
      </Badge>
    );
  };

  return (
    <div className="py-4 first:pt-0">
      <div className="flex items-start justify-between group">
        <div>
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {task.dueDate && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
            {task.priority && (
              <Badge 
                variant="outline" 
                className={`text-[10px] ${
                  task.priority === 'high' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : task.priority === 'medium' 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </Badge>
            )}
            {renderAssigneeBadge(task.assignee)}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(task.id)}
            className="h-8 w-8 p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
