
import React from 'react';
import TasksReview from '@/components/TasksReview';
import { Task } from '@/utils/parser';
import { ApiProps } from '../types';

interface TasksStepProps {
  rawText: string;
  initialTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onAddToMotion: (tasks: Task[], projectName: string | null) => void;
  apiProps: ApiProps;
}

const TasksStep: React.FC<TasksStepProps> = ({
  rawText,
  initialTasks,
  projectName,
  onBack,
  onAddToMotion,
  apiProps
}) => {
  return (
    <TasksReview 
      rawText={rawText}
      initialTasks={initialTasks}
      projectName={projectName}
      onBack={onBack}
      onAddToMotion={onAddToMotion}
      apiProps={apiProps}
    />
  );
};

export default TasksStep;
