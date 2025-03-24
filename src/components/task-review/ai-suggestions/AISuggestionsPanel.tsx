
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { TaskSuggestion } from '@/hooks/useAISuggestions';
import { Task } from '@/utils/task-parser/types';

interface AISuggestionsPanelProps {
  suggestions: TaskSuggestion[];
  tasks: Task[];
  isLoading: boolean;
  onApplySuggestion: (suggestionId: number, apply: boolean) => void;
  onApplyAll: (apply: boolean) => void;
  onFinish: () => void;
  error?: string | null;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  suggestions,
  tasks,
  isLoading,
  onApplySuggestion,
  onApplyAll,
  onFinish,
  error
}) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Get suggestions for the active task
  const filteredSuggestions = activeTaskId 
    ? suggestions.filter(s => s.taskId === activeTaskId) 
    : suggestions;
  
  // Get task by ID
  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  // Format field name for display
  const formatFieldName = (field: keyof Task) => {
    // Use a switch statement to handle special cases and default to capitalizing the field name
    switch (field) {
      case 'dueDate':
        return 'Due Date';
      case 'startDate':
        return 'Start Date';
      case 'timeEstimate':
        return 'Time Estimate';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  // Format value for display
  const formatValue = (field: keyof Task, value: any): string => {
    if (value === null || value === undefined) return 'None';
    
    switch (field) {
      case 'dueDate':
      case 'startDate':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      case 'timeEstimate':
        return `${value} minutes`;
      case 'labels':
        return Array.isArray(value) ? value.join(', ') : String(value);
      default:
        return String(value);
    }
  };

  // Get color for priority
  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Review and apply AI-generated suggestions to improve your tasks
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        {!error && isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing tasks with AI...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No suggestions available.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap mb-4">
                <Button 
                  onClick={() => setActiveTaskId(null)} 
                  variant={activeTaskId === null ? "default" : "outline"}
                  size="sm"
                >
                  All Tasks
                </Button>
                {tasks.map(task => (
                  <Button
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    variant={activeTaskId === task.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    disabled={!suggestions.some(s => s.taskId === task.id)}
                  >
                    {task.title.substring(0, 20)}{task.title.length > 20 ? '...' : ''}
                  </Button>
                ))}
              </div>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion, idx) => {
                  const task = getTaskById(suggestion.taskId);
                  if (!task) return null;
                  
                  return (
                    <div 
                      key={`${suggestion.taskId}-${suggestion.field}-${idx}`} 
                      className={`border rounded-md p-3 ${suggestion.applied ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                    >
                      <div className="mb-2 font-medium text-sm">
                        Task: {task.title}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Current {formatFieldName(suggestion.field)}:</span>
                          <div className="mt-1">
                            {suggestion.field === 'priority' && suggestion.currentValue ? (
                              <Badge variant="outline" className={getPriorityColor(suggestion.currentValue)}>
                                {formatValue(suggestion.field, suggestion.currentValue)}
                              </Badge>
                            ) : (
                              <span className="text-sm">{formatValue(suggestion.field, suggestion.currentValue)}</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs text-muted-foreground">Suggested {formatFieldName(suggestion.field)}:</span>
                          <div className="mt-1">
                            {suggestion.field === 'priority' ? (
                              <Badge variant="outline" className={getPriorityColor(suggestion.suggestedValue)}>
                                {formatValue(suggestion.field, suggestion.suggestedValue)}
                              </Badge>
                            ) : (
                              <span className="text-sm font-medium">{formatValue(suggestion.field, suggestion.suggestedValue)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-3">
                        {suggestion.reasoning}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant={suggestion.applied ? "outline" : "destructive"} 
                          onClick={() => onApplySuggestion(idx, false)}
                        >
                          {suggestion.applied ? 'Reject' : 'Ignore'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={suggestion.applied ? "outline" : "default"} 
                          onClick={() => onApplySuggestion(idx, true)}
                        >
                          {suggestion.applied ? 'Applied' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading || suggestions.length === 0}
            onClick={() => onApplyAll(false)}
          >
            Reject All
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="ml-2"
            disabled={isLoading || suggestions.length === 0}
            onClick={() => onApplyAll(true)}
          >
            Apply All
          </Button>
        </div>
        <Button 
          disabled={isLoading}
          onClick={onFinish}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};
