
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/utils/task-parser/types';
import { CalendarIcon, ClockIcon, AlertTriangleIcon, UserIcon } from 'lucide-react';

interface TaskSuggestionsProps {
  task: Task;
  onApplySuggestion: (field: string, value: any) => void;
}

const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({ 
  task,
  onApplySuggestion
}) => {
  if (!task.suggestions) return null;
  
  const { suggestedDueDate, suggestedPriority, suggestedDescription, reasoning } = task.suggestions;
  
  // Check if we have any suggestions
  const hasSuggestions = suggestedDueDate || suggestedPriority || suggestedDescription;
  
  if (!hasSuggestions) return null;
  
  return (
    <Card className="bg-blue-50 border-blue-200 mt-2">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
          <span className="mr-2">✨</span> AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0 text-sm">
        {reasoning && (
          <p className="text-blue-700 mb-2 italic text-xs">{reasoning}</p>
        )}
        
        <div className="space-y-2">
          {suggestedDueDate && (
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-800">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                <span>Suggested due date: {new Date(suggestedDueDate).toLocaleDateString()}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 bg-blue-100 hover:bg-blue-200 text-blue-800"
                onClick={() => onApplySuggestion('dueDate', suggestedDueDate)}
              >
                Apply
              </Button>
            </div>
          )}
          
          {suggestedPriority && (
            <div className="flex justify-between items-center">
              <div className="flex items-center text-blue-800">
                <AlertTriangleIcon className="h-3.5 w-3.5 mr-1" />
                <span>Suggested priority: </span>
                <Badge 
                  className={`ml-1 ${
                    suggestedPriority === 'high' 
                      ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                      : suggestedPriority === 'medium' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                  }`}
                >
                  {suggestedPriority}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 bg-blue-100 hover:bg-blue-200 text-blue-800"
                onClick={() => onApplySuggestion('priority', suggestedPriority)}
              >
                Apply
              </Button>
            </div>
          )}
          
          {suggestedDescription && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-blue-800">
                <div className="flex items-center">
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Suggested description:</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 bg-blue-100 hover:bg-blue-200 text-blue-800"
                  onClick={() => onApplySuggestion('description', suggestedDescription)}
                >
                  Apply
                </Button>
              </div>
              <div className="pl-5 italic text-blue-700 bg-blue-100 p-2 rounded text-xs">
                "{suggestedDescription}"
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskSuggestions;
