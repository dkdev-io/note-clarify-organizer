import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/parser';
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon, LoaderIcon, ExternalLinkIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addTasksToMotion } from '@/utils/motion';
import TasksList from './TasksList';
import ProjectNameInput from './ProjectNameInput';

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
    const tasksWithCorrectAssignees = initialTasks.map(task => ({
      ...task,
      assignee: task.assignee || null
    }));
    
    setEditedTasks(tasksWithCorrectAssignees);
    
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
      const tasksWithProject = editedTasks.map(task => ({
        ...task,
        project: editedProjectName || task.project,
        assignee: task.assignee || null
      }));

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

  const handleProjectNameChange = (name: string | null) => {
    setEditedProjectName(name);
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
          <ProjectNameInput 
            projectName={editedProjectName} 
            onChange={handleProjectNameChange} 
          />
        </CardHeader>
        
        <CardContent className="pb-0">
          <TasksList 
            tasks={editedTasks}
            editingTaskId={editingTaskId}
            isLoading={isLoading}
            onEditTask={handleEditTask}
            onSaveTask={handleSaveTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onBack={handleBack}
          />
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
