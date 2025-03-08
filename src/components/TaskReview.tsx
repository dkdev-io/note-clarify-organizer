import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, refineTask, validateTasks } from '@/utils/parser';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, CheckCircle2Icon, EditIcon, TrashIcon, AlertCircleIcon } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fetchWorkspaces } from '@/utils/motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface TaskReviewProps {
  tasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[], updatedProjectName?: string) => void;
}

const TaskReview: React.FC<TaskReviewProps> = ({ 
  tasks, 
  projectName,
  onBack, 
  onContinue 
}) => {
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>(tasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [workspaces, setWorkspaces] = useState<{id: string; name: string}[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [validation, setValidation] = useState<{
    allValid: boolean;
    tasksWithMissingFields: { task: Task; missingFields: string[] }[]
  }>({ allValid: true, tasksWithMissingFields: [] });
  const { toast } = useToast();

  useEffect(() => {
    const getWorkspaces = async () => {
      setIsLoadingWorkspaces(true);
      try {
        const fetchedWorkspaces = await fetchWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        
        if (fetchedWorkspaces.length > 0) {
          const firstWorkspaceId = fetchedWorkspaces[0].id;
          setReviewedTasks(prevTasks => 
            prevTasks.map(task => ({
              ...task,
              workspace_id: task.workspace_id || firstWorkspaceId
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };
    
    getWorkspaces();
  }, [toast]);

  useEffect(() => {
    const validationResult = validateTasks(reviewedTasks);
    setValidation(validationResult);
  }, [reviewedTasks]);

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({ ...task });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTask(null);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      setReviewedTasks(reviewedTasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTaskId(null);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setReviewedTasks(reviewedTasks.filter(task => task.id !== taskId));
  };

  const handleContinue = () => {
    const validationResult = validateTasks(reviewedTasks);
    if (!validationResult.allValid) {
      setValidation(validationResult);
      
      toast({
        title: "Missing information",
        description: "Some tasks are missing required fields. Please complete them before continuing.",
        variant: "destructive",
      });
      
      if (validationResult.tasksWithMissingFields.length > 0) {
        const firstInvalidTask = validationResult.tasksWithMissingFields[0].task;
        handleEditTask(firstInvalidTask);
      }
      
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(reviewedTasks, projectName);
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  const getWorkspaceName = (id: string | null) => {
    if (!id) return "Not assigned";
    const workspace = workspaces.find(w => w.id === id);
    return workspace ? workspace.name : "Unknown workspace";
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900 flex items-center">
            <CheckCircle2Icon className="inline-block mr-2 h-6 w-6 text-primary" />
            Review Tasks
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Review and edit your tasks before sending them to Motion
          </p>
        </CardHeader>
        
        <CardContent className="pb-0">
          {!validation.allValid && validation.tasksWithMissingFields.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Missing information</AlertTitle>
              <AlertDescription>
                {validation.tasksWithMissingFields.length} task(s) are missing required fields.
                Please complete all required information to continue.
              </AlertDescription>
            </Alert>
          )}
          
          {reviewedTasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No tasks selected.</p>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Extraction
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-1">
              {reviewedTasks.map((task) => {
                const taskValidation = validation.tasksWithMissingFields.find(t => t.task.id === task.id);
                const hasErrors = !!taskValidation;
                
                return (
                  <Card 
                    key={task.id} 
                    className={`shadow-subtle overflow-hidden ${
                      editingTaskId === task.id 
                        ? 'border-primary ring-1 ring-primary/20' 
                        : hasErrors 
                          ? 'border-red-300 ring-1 ring-red-200' 
                          : 'border-gray-100'
                    }`}
                  >
                    {editingTaskId === task.id && editingTask ? (
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="flex items-center">
                            Task Name
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input 
                            id="title"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            className={`border-gray-200 ${
                              taskValidation?.missingFields.includes('title') ? 'border-red-300 focus:border-red-500' : ''
                            }`}
                          />
                          {taskValidation?.missingFields.includes('title') && (
                            <p className="text-xs text-red-500 mt-1">Task name is required</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description"
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            className="border-gray-200 resize-none min-h-[80px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="workspace" className="flex items-center">
                            Workspace
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select 
                            value={editingTask.workspace_id || ''} 
                            onValueChange={(value) => setEditingTask({
                              ...editingTask, 
                              workspace_id: value
                            })}
                          >
                            <SelectTrigger 
                              id="workspace" 
                              className={`border-gray-200 ${
                                taskValidation?.missingFields.includes('workspace_id') ? 'border-red-300 focus:border-red-500' : ''
                              }`}
                            >
                              <SelectValue placeholder="Select workspace" />
                            </SelectTrigger>
                            <SelectContent>
                              {workspaces.map(workspace => (
                                <SelectItem key={workspace.id} value={workspace.id}>
                                  {workspace.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {taskValidation?.missingFields.includes('workspace_id') && (
                            <p className="text-xs text-red-500 mt-1">Workspace is required</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal border-gray-200"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editingTask.dueDate ? (
                                    format(new Date(editingTask.dueDate), "PPP")
                                  ) : (
                                    <span className="text-muted-foreground">Select date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                                  onSelect={(date) => setEditingTask({
                                    ...editingTask, 
                                    dueDate: date ? format(date, "yyyy-MM-dd") : null
                                  })}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select 
                              value={editingTask.priority || ''} 
                              onValueChange={(value) => setEditingTask({
                                ...editingTask, 
                                priority: value as 'low' | 'medium' | 'high' | null
                              })}
                            >
                              <SelectTrigger id="priority" className="border-gray-200">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Priority</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Input 
                              id="assignee"
                              value={editingTask.assignee || ''}
                              onChange={(e) => setEditingTask({...editingTask, assignee: e.target.value || null})}
                              placeholder="Enter assignee name"
                              className="border-gray-200"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                              value={editingTask.status} 
                              onValueChange={(value) => setEditingTask({
                                ...editingTask, 
                                status: value as 'todo' | 'in-progress' | 'done'
                              })}
                            >
                              <SelectTrigger id="status" className="border-gray-200">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="isRecurring" 
                              checked={editingTask.isRecurring}
                              onChange={(e) => setEditingTask({...editingTask, isRecurring: e.target.checked})}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <Label htmlFor="isRecurring" className="cursor-pointer">This is a recurring task</Label>
                          </div>
                          
                          {editingTask.isRecurring && (
                            <div className="mt-2">
                              <Label htmlFor="frequency" className="flex items-center">
                                Frequency
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Select 
                                value={editingTask.frequency || ''} 
                                onValueChange={(value) => setEditingTask({
                                  ...editingTask, 
                                  frequency: value
                                })}
                              >
                                <SelectTrigger 
                                  id="frequency" 
                                  className={`border-gray-200 mt-1 ${
                                    taskValidation?.missingFields.includes('frequency') ? 'border-red-300 focus:border-red-500' : ''
                                  }`}
                                >
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Biweekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              {taskValidation?.missingFields.includes('frequency') && (
                                <p className="text-xs text-red-500 mt-1">Frequency is required for recurring tasks</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSaveEdit}
                            size="sm"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">
                            {task.title}
                            {hasErrors && (
                              <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                                Missing info
                              </Badge>
                            )}
                          </h3>
                          <div className="flex gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-primary"
                              onClick={() => handleEditTask(task)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Workspace: {getWorkspaceName(task.workspace_id)}
                          </Badge>
                          
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
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between py-4 mt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={reviewedTasks.length === 0 || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Preview Tasks
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskReview;
