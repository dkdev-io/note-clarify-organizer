
import React, { useEffect, useState } from 'react';
import { Task } from '@/utils/task-parser/types';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { AISuggestionsPanel } from './ai-suggestions/AISuggestionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface TaskAIEnhancerProps {
  tasks: Task[];
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
}

const TaskAIEnhancer: React.FC<TaskAIEnhancerProps> = ({
  tasks,
  onBack,
  onContinue
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  
  const {
    isAnalyzing,
    suggestions,
    error,
    analyzeTasks,
    applySuggestion,
    applyAllSuggestions,
    getUpdatedTasks
  } = useAISuggestions();

  // Analyze tasks when the component mounts
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        await analyzeTasks(tasks);
      } catch (error) {
        console.error('Error analyzing tasks:', error);
        toast({
          title: "Error analyzing tasks",
          description: "There was a problem analyzing your tasks. You can continue with the original tasks.",
          variant: "destructive"
        });
      }
    };

    runAnalysis();
  }, [tasks]);

  const handleFinish = () => {
    setIsTransitioning(true);
    
    // Get tasks with all accepted suggestions applied
    const updatedTasks = getUpdatedTasks(tasks);
    
    // Count how many suggestions were applied
    const appliedCount = suggestions.filter(s => s.applied).length;
    
    toast({
      title: "Suggestions applied",
      description: `Applied ${appliedCount} suggestion${appliedCount !== 1 ? 's' : ''} to your tasks.`,
    });
    
    setTimeout(() => {
      onContinue(updatedTasks);
    }, 500);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ${
      isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
    }`}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl">AI Task Enhancement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our AI has analyzed your tasks and made suggestions to improve them. Review these suggestions and apply the ones you like.
          </p>
        </CardContent>
      </Card>
      
      <AISuggestionsPanel
        suggestions={suggestions}
        tasks={tasks}
        isLoading={isAnalyzing}
        onApplySuggestion={applySuggestion}
        onApplyAll={applyAllSuggestions}
        onFinish={handleFinish}
        error={error}
      />
    </div>
  );
};

export default TaskAIEnhancer;
