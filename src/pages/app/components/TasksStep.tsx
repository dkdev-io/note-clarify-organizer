
import React, { useEffect, useState } from 'react';
import { TasksReview } from '@/components/task-review';
import { Task } from '@/utils/parser';
import { ApiProps } from '../types';

interface TasksStepProps {
  rawText: string;
  initialTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onAddToMotion: (tasks: Task[], projectName: string | null, unassignedCount: number) => void;
  apiProps: ApiProps;
  unrecognizedUserMappings?: Record<string, string | null>;
}

const TasksStep: React.FC<TasksStepProps> = ({
  rawText,
  initialTasks,
  projectName,
  onBack,
  onAddToMotion,
  apiProps,
  unrecognizedUserMappings = {}
}) => {
  // Apply the user mappings to the initial tasks
  const [processedTasks, setProcessedTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Apply the user mappings to the initial tasks
    const updatedTasks = initialTasks.map(task => {
      const taskAssignee = task.assignee;
      
      // If this task has an assignee that was marked as unassigned in the mappings
      if (taskAssignee && Object.keys(unrecognizedUserMappings).includes(taskAssignee)) {
        // Check if this name was mapped to null (unassigned)
        if (unrecognizedUserMappings[taskAssignee] === null) {
          return {
            ...task,
            assignee: null // Clear the assignee
          };
        }
      }
      
      // Make sure the project name is set correctly
      return {
        ...task,
        project: projectName || task.project
      };
    });
    
    console.log('Processed tasks with project name:', projectName, updatedTasks);
    setProcessedTasks(updatedTasks);
  }, [initialTasks, unrecognizedUserMappings, projectName]);

  // Count unassigned tasks (those with null assignments in mappings)
  const countUnassignedTasks = () => {
    return Object.values(unrecognizedUserMappings).filter(id => id === null).length;
  };

  const handleAddToMotion = (tasks: Task[], updatedProjectName: string | null) => {
    // Ensure all tasks have the correct project name set
    const tasksWithProject = tasks.map(task => ({
      ...task,
      project: updatedProjectName || task.project || projectName
    }));
    
    console.log('Adding tasks with project name:', updatedProjectName, tasksWithProject);
    onAddToMotion(tasksWithProject, updatedProjectName, countUnassignedTasks());
  };

  return (
    <TasksReview 
      rawText={rawText}
      initialTasks={processedTasks}
      projectName={projectName}
      onBack={onBack}
      onAddToMotion={handleAddToMotion}
      apiProps={apiProps}
    />
  );
};

export default TasksStep;
