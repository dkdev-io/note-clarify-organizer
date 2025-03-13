
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Task } from '@/utils/parser';
import { useToast } from "@/hooks/use-toast";
import TasksList from './TasksList';
import TaskReviewHeader from './TaskReviewHeader';
import TaskReviewFooter from './TaskReviewFooter';
import { ApiProps } from '@/pages/converter/types';
import { addTasksToMotionService } from './task-review-service';

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
      const result = await addTasksToMotionService(
        editedTasks,
        editedProjectName,
        apiProps
      );
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        onAddToMotion(editedTasks, editedProjectName);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
        console.error("Failed to add tasks:", result.errors);
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
        <TaskReviewHeader 
          tasksCount={editedTasks.length}
          projectName={editedProjectName}
          onProjectNameChange={handleProjectNameChange}
        />
        
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
        
        <TaskReviewFooter 
          onBack={handleBack}
          onAddToMotion={handleAddToMotion}
          isLoading={isLoading}
          isProcessing={isProcessing}
          isTransitioning={isTransitioning}
          editingTaskId={editingTaskId}
          tasksLength={editedTasks.length}
        />
      </Card>
    </div>
  );
};

export default TasksReview;
