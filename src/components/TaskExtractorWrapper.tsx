
import React, { useState } from 'react';
import TaskExtractor from './TaskExtractor';
import { Task } from '@/utils/task-parser/types';

interface TaskExtractorWrapperProps {
  rawText: string;
  extractedTasks: Task[];
  isProcessing: boolean;
  projectName: string | null;
  onProcessText: (text: string) => Promise<void>;
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
}

const TaskExtractorWrapper: React.FC<TaskExtractorWrapperProps> = ({
  rawText,
  extractedTasks,
  isProcessing,
  projectName,
  onProcessText,
  onBack,
  onContinue
}) => {
  const [textInput, setTextInput] = useState(rawText);

  // Our custom text processing handler
  const handleTextSubmit = async () => {
    if (onProcessText) {
      await onProcessText(textInput);
    }
  };

  return (
    <TaskExtractor
      rawText={textInput}
      extractedTasks={extractedTasks}
      projectName={projectName}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
};

export default TaskExtractorWrapper;
