
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from '@/utils/parser';
import { 
  TaskHeader, 
  TasksLoading, 
  TasksList, 
  TaskFooter 
} from './task-extractor';
import { useTaskExtractor } from '@/hooks/useTaskExtractor';

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
  const {
    isLoading,
    selectedTasks,
    isTransitioning,
    toggleTask,
    handleContinue,
    handleBack
  } = useTaskExtractor({
    rawText,
    extractedTasks,
    onContinue
  });

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
              onBack={() => handleBack(onBack)}
            />
          )}
        </CardContent>
        
        <CardFooter>
          <TaskFooter 
            selectedTasksCount={selectedTasks.length}
            isLoading={isLoading}
            isTransitioning={isTransitioning}
            onBack={() => handleBack(onBack)}
            onContinue={() => handleContinue()}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskExtractor;
