
import React from 'react';
import { Task } from '@/utils/parser';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from 'lucide-react';
import { TaskPriorityBadge, TaskAssigneeBadge, TaskDueDateBadge } from './badges';

interface TaskItemProps {
  task: Task;
  isEditing?: boolean;
  onEdit: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onSave?: () => void;
  onUpdateTask?: (field: keyof Task, value: any) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  isEditing = false, 
  onEdit, 
  onDelete = () => {}, 
  onSave = () => {},
  onUpdateTask = () => {} 
}) => {
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
                <TaskPriorityBadge priority={task.priority} />
                <TaskAssigneeBadge assignee={task.assignee} />
                <TaskDueDateBadge dueDate={task.dueDate} />
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 rounded-full"
                  onClick={() => onSave()}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 rounded-full"
                  onClick={() => onEdit(task.id)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-red-600 rounded-full"
                  onClick={() => onDelete(task.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
