
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from '@/utils/parser';
import { 
  TaskHeader, 
  TasksLoading, 
  TasksList, 
  TaskFooter 
} from './task-extractor';

interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
}

interface TaskExtractorProps {
  rawText: string;
  extractedTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
  apiProps?: ApiProps;
}

const TaskExtractor: React.FC<TaskExtractorProps> = ({ 
  rawText, 
  extractedTasks,
  projectName,
  onBack, 
  onContinue,
  apiProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Select all tasks by default
    setSelectedTasks([...extractedTasks]);
    
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

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${
      isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
    }`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card overflow-hidden">
        <CardHeader>
          <TaskHeader 
            projectName={projectName}
            selectedTasksCount={selectedTasks.length}
            totalTasksCount={extractedTasks.length}
          />
        </CardHeader>
        
        <CardContent className="pb-0">
          {isLoading ? (
            <TasksLoading />
          ) : (
            <TasksList 
              tasks={extractedTasks}
              selectedTasks={selectedTasks}
              toggleTask={toggleTask}
              onBack={handleBack}
            />
          )}
        </CardContent>
        
        <CardFooter>
          <TaskFooter 
            selectedTasksCount={selectedTasks.length}
            isLoading={isLoading}
            isTransitioning={isTransitioning}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskExtractor;
