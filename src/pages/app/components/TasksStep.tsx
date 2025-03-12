
import React, { useState } from 'react';
import TasksReview from '@/components/TasksReview';
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
  // Count unassigned tasks (those with null assignments in mappings)
  const countUnassignedTasks = () => {
    return Object.values(unrecognizedUserMappings).filter(id => id === null).length;
  };

  const handleAddToMotion = (tasks: Task[], updatedProjectName: string | null) => {
    onAddToMotion(tasks, updatedProjectName, countUnassignedTasks());
  };

  return (
    <TasksReview 
      rawText={rawText}
      initialTasks={initialTasks}
      projectName={projectName}
      onBack={onBack}
      onAddToMotion={handleAddToMotion}
      apiProps={apiProps}
      unrecognizedUserMappings={unrecognizedUserMappings}
    />
  );
};

export default TasksStep;
