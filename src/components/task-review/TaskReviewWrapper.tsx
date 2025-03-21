
import React from 'react';
import { Task } from '@/utils/parser';
import RefactoredTaskReview from './RefactoredTaskReview';
import { ApiProps } from '@/pages/converter/types';

interface TaskReviewProps {
  tasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[], updatedProjectName?: string) => void;
  apiProps?: ApiProps;
}

// This wrapper ensures compatibility with code that uses the original TaskReview component
const TaskReview: React.FC<TaskReviewProps> = (props) => {
  return <RefactoredTaskReview {...props} />;
};

export default TaskReview;
