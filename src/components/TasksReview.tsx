
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon, LoaderIcon, PencilIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { addTasksToMotion } from '@/utils/motion';

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

interface TasksReviewProps {
  rawText: string;
  initialTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onAddToMotion: (tasks: Task[], projectName: string | null) => void;
  apiProps: ApiProps;
}

const TasksReview: React.FC<TasksReviewProps> = ({ 
  rawText, 
  initialTasks, 
  projectName, 
  onBack, 
  onAddToMotion,
  apiProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTasks, setEditedTasks] = useState<Task[]>([]);
  const [editedProjectName, setEditedProjectName] = useState<string | null>(projectName);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize tasks
    setEditedTasks([...initialTasks]);
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [initialTasks]);

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveTask = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = (taskId: string, field: keyof Task, value: any) => {
    setEditedTasks(editedTasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setEditedTasks(editedTasks.filter(task => task.id !== taskId));
  };

  const handleAddToMotion = async () => {
    if (editedTasks.length === 0) {
      toast({
        title: "No tasks to add",
        description: "Please create at least one task to add to Motion.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update project name for all tasks
      const tasksWithProject = editedTasks.map(task => ({
        ...task,
        project: editedProjectName || task.project
      }));

      // If API is connected, try to add tasks to Motion directly
      if (apiProps.isConnected && apiProps.selectedWorkspaceId) {
        const result = await addTasksToMotion(
          tasksWithProject, 
          apiProps.selectedWorkspaceId, 
          apiProps.apiKey || undefined
        );
        
        if (result.success) {
          toast({
            title: "Success!",
            description: result.message,
          });
          onAddToMotion(tasksWithProject, editedProjectName);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
          console.error("Failed to add tasks:", result.errors);
        }
      } else {
        // If not connected, just pass the tasks to the parent component
        onAddToMotion(tasksWithProject, editedProjectName);
      }
    } catch (error) {
      console.error("Error adding tasks to Motion:", error);
      toast({
        title: "Error",
        description: "Failed to add tasks to Motion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
              <CheckIcon className="inline-block mr-2 h-6 w-6 text-primary" />
              Review Tasks
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {editedTasks.length} Tasks
            </Badge>
          </div>
          <CardDescription>
            Review and edit tasks before adding them to Motion
          </CardDescription>
          <div className="mt-4 flex items-center gap-3">
            <Label htmlFor="project-name" className="text-sm font-medium">Project Name:</Label>
            <Input 
              id="project-name"
              value={editedProjectName || ''}
              onChange={(e) => setEditedProjectName(e.target.value || null)}
              className="h-8 max-w-[250px]"
              placeholder="No project (optional)"
            />
          </div>
        </CardHeader>
        
        <CardContent className="pb-0">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <div className="h-5 w-5 rounded-full border border-gray-300 bg-white"></div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {editedTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">No tasks found in your notes. Go back to add some text.</p>
                  <Button variant="outline" onClick={handleBack} className="mt-4">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Notes
                  </Button>
                </div>
              ) : (
                editedTasks.map((task) => (
                  <div key={task.id} className="py-4 first:pt-0">
                    {editingTaskId === task.id ? (
                      <div className="space-y-4 bg-accent/30 p-3 rounded-md -mx-3">
                        <div>
                          <Label htmlFor={`title-${task.id}`} className="text-sm font-medium mb-1 block">
                            Task Title
                          </Label>
                          <Input 
                            id={`title-${task.id}`}
                            value={task.title}
                            onChange={(e) => handleUpdateTask(task.id, 'title', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`description-${task.id}`} className="text-sm font-medium mb-1 block">
                            Description (Optional)
                          </Label>
                          <Textarea 
                            id={`description-${task.id}`}
                            value={task.description || ''}
                            onChange={(e) => handleUpdateTask(task.id, 'description', e.target.value)}
                            className="w-full resize-none"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`priority-${task.id}`} className="text-sm font-medium mb-1 block">
                              Priority
                            </Label>
                            <Select 
                              value={task.priority || 'normal'}
                              onValueChange={(value) => handleUpdateTask(task.id, 'priority', value)}
                            >
                              <SelectTrigger id={`priority-${task.id}`} className="w-full">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`assignee-${task.id}`} className="text-sm font-medium mb-1 block">
                              Assignee (Optional)
                            </Label>
                            <Input 
                              id={`assignee-${task.id}`}
                              value={task.assignee || ''}
                              onChange={(e) => handleUpdateTask(task.id, 'assignee', e.target.value)}
                              className="w-full"
                              placeholder="Assignee name"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium mb-1 block">
                            Due Date (Optional)
                          </Label>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal w-full",
                                    !task.dueDate && "text-muted-foreground"
                                  )}
                                >
                                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                  onSelect={(date) => handleUpdateTask(task.id, 'dueDate', date?.toISOString() || null)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            
                            {task.dueDate && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdateTask(task.id, 'dueDate', null)}
                                className="h-8 px-2"
                              >
                                <TrashIcon className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <Button onClick={handleSaveTask}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                            {task.assignee && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                Assignee: {task.assignee}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditTask(task.id)}
                            className="h-8 w-8 p-0"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
            disabled={isLoading || isProcessing || isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleAddToMotion}
            disabled={editedTasks.length === 0 || isLoading || isProcessing || isTransitioning || editingTaskId !== null}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Add to Motion
                <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TasksReview;
