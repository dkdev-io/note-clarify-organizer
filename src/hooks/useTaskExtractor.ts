
import { useState, useEffect } from 'react';
import { Task } from '@/utils/parser';

interface UseTaskExtractorProps {
  rawText: string;
  extractedTasks: Task[];
  onContinue: (tasks: Task[]) => void;
}

export function useTaskExtractor({ 
  rawText, 
  extractedTasks,
  onContinue 
}: UseTaskExtractorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Debug log to trace tasks reaching the hook
    console.log('useTaskExtractor received tasks:', extractedTasks);
    
    // Make sure extractedTasks is an array before proceeding
    const tasksArray = Array.isArray(extractedTasks) ? extractedTasks : [];
    
    // Select all tasks by default
    setSelectedTasks([...tasksArray]);
    
    // Simulate processing delay for a smoother UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [extractedTasks]);

  const toggleTask = (task: Task) => {
    if (selectedTasks.some(t => t.id === task.id)) {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(selectedTasks);
    }, 400);
  };

  const handleBack = (onBack: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  return {
    isLoading,
    selectedTasks,
    isTransitioning,
    toggleTask,
    handleContinue,
    handleBack
  };
}
