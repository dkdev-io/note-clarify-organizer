import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { addTasksToMotion } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define interface for the API props
interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

export interface TaskPreviewProps {
  tasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onComplete: () => void;
  apiProps: ApiProps;
}

const TaskPreview: React.FC<TaskPreviewProps> = ({ 
  tasks, 
  projectName, 
  onBack, 
  onComplete,
  apiProps
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errors, setErrors] = useState<any[] | null>(null);
  const { toast } = useToast();

  // Find the project ID that matches the project name
  const findProjectId = (): string | undefined => {
    // If we're not connected, return undefined
    if (!apiProps.isConnected || !apiProps.workspaces) {
      return undefined;
    }
    
    // Find the project ID by name
    if (apiProps.workspaces && apiProps.selectedWorkspaceId && apiProps.selectedProject) {
      console.log("Looking for project ID for:", apiProps.selectedProject);
      
      const selectedWorkspace = apiProps.workspaces.find(
        workspace => workspace.id === apiProps.selectedWorkspaceId
      );
      
      if (selectedWorkspace && selectedWorkspace.projects) {
        const project = selectedWorkspace.projects.find(
          (p: any) => p.name === apiProps.selectedProject
        );
        
        if (project) {
          console.log("Found project ID:", project.id);
          return project.id;
        }
      }
    }
    
    return undefined;
  };

  const handleAddToMotion = async () => {
    setIsSubmitting(true);
    setErrors(null);
    
    try {
      // If not connected to Motion API, simulate success
      if (!apiProps.isConnected || !apiProps.apiKey || !apiProps.selectedWorkspaceId) {
        toast({
          title: "Success (Demo Mode)",
          description: `${tasks.length} tasks would be added to Motion${projectName ? ` under project '${projectName}'` : ''}.`,
        });
        
        // Wait a bit to simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        handleComplete();
        return;
      }
      
      // Find the project ID
      const projectId = findProjectId();
      console.log("Using project ID:", projectId);
      
      // Add tasks to Motion via API
      const result = await addTasksToMotion(
        tasks, 
        apiProps.selectedWorkspaceId,
        apiProps.apiKey,
        projectId,
        undefined, // timeEstimate
        undefined // users not available in this component
      );
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        if (result.errors && result.errors.length > 0) {
          setErrors(result.errors);
        } else {
          handleComplete();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error adding tasks to Motion:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding tasks to Motion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  // Function to format error messages more readably
  const formatErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    if (error && typeof error === 'object') {
      // Check if it's a validation error with message property
      if (error.message) return error.message;
      
      // If it has an errors array, flatten it
      if (error.errors && Array.isArray(error.errors)) {
        return error.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      }
      
      // Otherwise stringify the object
      return JSON.stringify(error);
    }
    
    return 'Unknown error';
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-medium text-gray-900">
              <CheckIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              Preview Tasks
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {tasks.length} Tasks
            </Badge>
          </div>
          <CardDescription>
            Review your tasks before adding them to Motion
          </CardDescription>
          {apiProps.isConnected && apiProps.selectedProject && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <CheckIcon className="h-3 w-3 mr-1" />
                Connected to Motion API
              </Badge>
              {apiProps.selectedWorkspaceId && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  Workspace: {apiProps.workspaces.find(w => w.id === apiProps.selectedWorkspaceId)?.name || apiProps.selectedWorkspaceId}
                </Badge>
              )}
              {apiProps.selectedProject && (
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                  Project: {apiProps.selectedProject}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pb-0">
          {errors && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Some tasks failed to add to Motion:</div>
                <ul className="list-disc list-inside mt-2 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>
                      {error.task}: {formatErrorMessage(error.error)}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No tasks to add. Go back to select some tasks.</p>
                <Button variant="outline" onClick={handleBack} className="mt-4">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="py-3 first:pt-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                </div>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between py-4 mt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isSubmitting || isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleAddToMotion}
            disabled={tasks.length === 0 || isSubmitting || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding to Motion...
              </>
            ) : (
              <>
                Add to Motion
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskPreview;
