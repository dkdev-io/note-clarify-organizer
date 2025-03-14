
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { BrainIcon, ArrowRightIcon, ArrowLeftIcon, LoaderIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
  users?: any[];
}

interface LLMProcessorProps {
  selectedTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
  apiProps: ApiProps;
}

const LLMProcessor: React.FC<LLMProcessorProps> = ({ 
  selectedTasks, 
  projectName,
  onBack, 
  onContinue,
  apiProps
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [enhancedTasks, setEnhancedTasks] = useState<Task[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const processTasksWithLLM = async () => {
      try {
        // Make a copy of the tasks first
        const tasksCopy = JSON.parse(JSON.stringify(selectedTasks));
        
        // Process tasks in batches to improve reliability
        const processTasks = async (tasks: Task[]) => {
          try {
            const response = await supabase.functions.invoke('process-task-batch', {
              body: {
                tasks,
                projectName
              }
            });
            
            if (response.error) {
              console.error('Error processing tasks batch:', response.error);
              return tasks; // Return original tasks if processing fails
            }
            
            if (!response.data || !response.data.tasks) {
              console.error('Invalid response from process-task-batch:', response.data);
              return tasks; // Return original tasks if invalid response
            }
            
            return response.data.tasks;
          } catch (error) {
            console.error('Error processing tasks batch:', error);
            return tasks; // Return original tasks if processing fails
          }
        };
        
        // Try to use the real API
        let processedTasks: Task[];
        
        try {
          processedTasks = await processTasks(tasksCopy);
          console.log('Tasks processed with LLM:', processedTasks);
        } catch (error) {
          console.error('Failed to process tasks with LLM:', error);
          
          // If real API fails, fall back to simple enhancement
          processedTasks = enhanceTasksLocally(tasksCopy);
          
          toast({
            description: "Using fallback task enhancement",
            variant: "default"
          });
        }
        
        setEnhancedTasks(processedTasks);
      } catch (error) {
        console.error('Error in LLM processing:', error);
        toast({
          title: "Processing error",
          description: "Using original tasks instead",
          variant: "destructive"
        });
        
        // Ensure we have tasks to show even if everything fails
        setEnhancedTasks(selectedTasks);
      } finally {
        // Short delay for better UX
        setTimeout(() => {
          setIsProcessing(false);
        }, 800);
      }
    };

    // Fallback function to enhance tasks locally
    const enhanceTasksLocally = (tasks: Task[]): Task[] => {
      console.log('Using local task enhancement as fallback');
      
      return tasks.map(task => {
        // Create a deep copy of the task
        const improved = { ...task };
        
        // Add or improve descriptions
        if (!improved.description) {
          improved.description = `This task requires attention to complete properly.`;
        } else if (improved.description.length < 30) {
          const additionalNotes = "Additional context: This task is important for project progress.";
          improved.description = `${improved.description} ${additionalNotes}`;
        }
        
        // Set priority based on content if not already set
        if (!improved.priority) {
          if (
            improved.title.toLowerCase().includes('urgent') || 
            improved.title.toLowerCase().includes('asap') ||
            improved.title.toLowerCase().includes('critical')
          ) {
            improved.priority = 'high';
          } else if (
            improved.title.toLowerCase().includes('soon') ||
            improved.title.toLowerCase().includes('important')
          ) {
            improved.priority = 'medium';
          } else {
            improved.priority = 'low';
          }
        }
        
        // Suggest a due date if none exists
        if (!improved.dueDate) {
          // Set a due date within the next 7 days
          const daysToAdd = Math.floor(Math.random() * 7) + 1;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysToAdd);
          improved.dueDate = dueDate.toISOString().split('T')[0];
        }
        
        return improved;
      });
    };
    
    // Start processing
    processTasksWithLLM();
  }, [selectedTasks, projectName, toast]);

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(enhancedTasks);
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
              <BrainIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              LLM Processing
            </CardTitle>
            <Badge variant="outline" className="font-normal gap-1.5">
              {selectedTasks.length} tasks
            </Badge>
          </div>
          <CardDescription>
            Using AI to enhance and improve your tasks
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
          {isProcessing ? (
            <div className="space-y-6 py-4">
              <div className="flex justify-center items-center mb-4">
                <LoaderIcon className="h-8 w-8 text-primary animate-spin" />
                <span className="ml-3 text-sm text-muted-foreground">
                  Processing tasks with AI...
                </span>
              </div>
              {selectedTasks.map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {enhancedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">No tasks were processed.</p>
                  <Button variant="outline" onClick={handleBack} className="mt-4">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              ) : (
                enhancedTasks.map((task) => (
                  <div key={task.id} className="py-3">
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
            disabled={isProcessing || isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={enhancedTasks.length === 0 || isProcessing || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Continue to Review
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LLMProcessor;
