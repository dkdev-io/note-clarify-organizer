
import React from 'react';
import { Task } from '@/utils/parser';
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon } from 'lucide-react';

interface TaskItemCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
}

const TaskItemCard: React.FC<TaskItemCardProps> = ({ 
  task, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      key={task.id} 
      className={`py-3 px-3 -mx-3 first:pt-0 cursor-pointer rounded-md transition-colors ${
        isSelected 
          ? 'bg-accent/50 hover:bg-accent/70' 
          : 'hover:bg-secondary/60'
      }`}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
            isSelected 
              ? 'border-primary bg-primary text-white' 
              : 'border-gray-300 bg-white'
          }`}>
            {isSelected && (
              <CheckCircleIcon className="h-5 w-5" />
            )}
          </div>
        </div>
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
            {task.assignee && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                Assignee: {task.assignee}
              </Badge>
            )}
            {task.project && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                Project: {task.project}
              </Badge>
            )}
            {task.duration && (
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
                {task.duration}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItemCard;
