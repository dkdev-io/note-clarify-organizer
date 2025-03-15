
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon, ListTodoIcon, LoaderIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
}

interface TaskExtractorProps {
  rawText: string;
  extractedTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
  apiProps?: ApiProps;
}

const TaskExtractor: React.FC<TaskExtractorProps> = ({ 
  rawText, 
  extractedTasks,
  projectName,
  onBack, 
  onContinue,
  apiProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Select all tasks by default
    setSelectedTasks([...extractedTasks]);
    
    // Simulate processing delay for a smoother UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [extractedTasks]);

  const toggleTask = (task: Task) => {
    if (selectedTasks.some(t => t.id === task.id)) {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(selectedTasks);
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-medium text-gray-900">
              <ListTodoIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              Extracted Tasks
            </CardTitle>
            <Badge variant="outline" className="font-normal gap-1.5">
              {selectedTasks.length} of {extractedTasks.length} selected
            </Badge>
          </div>
          <CardDescription>
            Select the items you want to convert into tasks
            {projectName && (
              <div className="mt-2">
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                  Project: {projectName}
                </Badge>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-0">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {extractedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">No tasks could be extracted from your notes.</p>
                  <Button variant="outline" onClick={handleBack} className="mt-4">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Notes
                  </Button>
                </div>
              ) : (
                extractedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`py-3 px-3 -mx-3 first:pt-0 cursor-pointer rounded-md transition-colors ${
                      selectedTasks.some(t => t.id === task.id) 
                        ? 'bg-accent/50 hover:bg-accent/70' 
                        : 'hover:bg-secondary/60'
                    }`}
                    onClick={() => toggleTask(task)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                          selectedTasks.some(t => t.id === task.id) 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedTasks.some(t => t.id === task.id) && (
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
                ))
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between py-4 mt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isLoading || isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={selectedTasks.length === 0 || isLoading || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Review Tasks
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskExtractor;
