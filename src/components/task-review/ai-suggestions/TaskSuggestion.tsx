
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from 'lucide-react';
import { formatDate } from 'date-fns';
import { 
  TaskPriorityBadge, 
  TaskAssigneeBadge, 
  TaskDueDateBadge,
  TaskHardDeadlineBadge
} from '../badges';

type Suggestion = {
  id: string;
  taskId: string;
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  applied: boolean;
};

interface TaskSuggestionProps {
  suggestion: Suggestion;
  onApply: (apply: boolean) => void;
}

const TaskSuggestion: React.FC<TaskSuggestionProps> = ({ suggestion, onApply }) => {
  const { field, currentValue, suggestedValue, reason, applied } = suggestion;
  
  const renderValue = (value: any, fieldName: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">None</span>;
    }
    
    switch (fieldName) {
      case 'priority':
        return <TaskPriorityBadge priority={value} />;
      case 'assignee':
        return <TaskAssigneeBadge assignee={value} />;
      case 'dueDate':
        return value ? <TaskDueDateBadge dueDate={value} /> : <span className="text-muted-foreground italic">None</span>;
      case 'hardDeadline':
        return <TaskHardDeadlineBadge hardDeadline={value} />;
      case 'labels':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((label, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {label}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-muted-foreground italic">None</span>;
      default:
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        return String(value);
    }
  };
  
  if (applied) {
    return (
      <Card className="bg-green-50 border-green-100">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-700">
                <CheckIcon className="inline-block h-4 w-4 mr-1" />
                {reason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{reason}</p>
          
          <div className="grid grid-cols-2 gap-2 my-1">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Current:</span>
              {renderValue(currentValue, field)}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Suggested:</span>
              {renderValue(suggestedValue, field)}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onApply(false)}
              className="h-8 px-2"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Ignore
            </Button>
            <Button 
              size="sm"
              onClick={() => onApply(true)}
              className="h-8 px-2 bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskSuggestion;
