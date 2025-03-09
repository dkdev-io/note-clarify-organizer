
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { ArrowLeftIcon, CheckIcon, LayoutListIcon, LoaderIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTasksToMotion, validateMotionApiKey } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
}

interface TaskPreviewProps {
  tasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onComplete: () => void;
  apiProps?: ApiProps;
}

const TaskPreview: React.FC<TaskPreviewProps> = ({ 
  tasks, 
  projectName,
  onBack, 
  onComplete,
  apiProps
}) => {
  // Initialize apiKey with the value from apiProps if connected
  const [apiKey, setApiKey] = useState(apiProps?.isConnected ? apiProps.apiKey || '' : '');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  // Auto-validate the key if we're connected
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(apiProps?.isConnected ? true : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  const validateKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Motion API key",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidatingKey(true);
    try {
      const isValid = await validateMotionApiKey(apiKey);
      setIsKeyValid(isValid);
      
      if (isValid) {
        toast({
          title: "Success",
          description: "Your Motion API key is valid",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid Motion API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
      setIsKeyValid(false);
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleSubmit = async () => {
    if (!isKeyValid) {
      toast({
        title: "Error",
        description: "Please validate your Motion API key first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await addTasksToMotion(tasks);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${result.successCount} task${result.successCount !== 1 ? 's' : ''} added to Motion`,
        });
        
        setIsTransitioning(true);
        setTimeout(() => {
          onComplete();
        }, 400);
      } else {
        if (result.taskErrors && result.taskErrors.length > 0) {
          result.taskErrors.forEach(taskError => {
            const task = tasks.find(t => t.id === taskError.taskId);
            if (task) {
              toast({
                title: `Error with task: ${task.title}`,
                description: taskError.errors.join(', '),
                variant: "destructive",
              });
            }
          });
        } else {
          toast({
            title: "Warning",
            description: `${result.successCount} added, ${result.failedCount} failed`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tasks to Motion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  const getWorkspaceName = (workspaceId: string | null) => {
    if (!workspaceId) return "None";
    
    // Try to get workspace name from apiProps if available
    if (apiProps?.workspaces && apiProps.workspaces.length > 0) {
      const workspace = apiProps.workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        return workspace.name;
      }
    }
    
    // Fallback to static mapping
    const workspaceMap: Record<string, string> = {
      'workspace-1': 'Personal',
      'workspace-2': 'Team Projects',
      'workspace-3': 'Client Work'
    };
    
    return workspaceMap[workspaceId] || 'Unknown';
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900 flex items-center">
            <LayoutListIcon className="inline-block mr-2 h-6 w-6 text-primary" />
            Motion Task Preview
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Preview your tasks before adding them to Motion
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {!apiProps?.isConnected && (
              <div className="bg-secondary p-4 rounded-md">
                <h3 className="font-medium text-sm text-secondary-foreground mb-3">API Configuration</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Motion API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your Motion API key"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsKeyValid(null);
                        }}
                        className={`flex-1 ${isKeyValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : 
                          isKeyValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      />
                      <Button 
                        onClick={validateKey}
                        disabled={!apiKey.trim() || isValidatingKey}
                        variant="outline"
                      >
                        {isValidatingKey ? (
                          <>
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            Validating
                          </>
                        ) : isKeyValid === true ? (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                            Validated
                          </>
                        ) : (
                          "Validate"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="font-medium">Tasks to Add ({tasks.length})</h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3 border border-gray-100 rounded-md bg-white shadow-subtle"
                  >
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        Workspace: {getWorkspaceName(task.workspace_id)}
                      </Badge>
                      
                      {task.description && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          Has Description
                        </Badge>
                      )}
                      
                      {task.dueDate && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </Badge>
                      )}
                      
                      {task.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
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
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          Assignee: {task.assignee}
                        </Badge>
                      )}
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.status === 'done' 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : task.status === 'in-progress'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {task.status === 'todo' ? 'To Do' : 
                         task.status === 'in-progress' ? 'In Progress' : 'Done'}
                      </Badge>
                      
                      {task.isRecurring && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                          Recurring: {task.frequency ? task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1) : 'Not set'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between py-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isSubmitting || isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isKeyValid || isSubmitting || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Adding to Motion
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Add to Motion
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskPreview;
