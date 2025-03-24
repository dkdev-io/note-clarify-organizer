
import { useState } from 'react';
import { Task } from '@/utils/task-parser/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export interface TaskSuggestion {
  taskId: string;
  field: keyof Task;
  currentValue: any;
  suggestedValue: any;
  reasoning: string;
  applied: boolean;
}

export interface EnhancedTask extends Task {
  suggestedDueDate?: string | null;
  suggestedStartDate?: string | null;
  suggestedPriority?: string | null;
  suggestedDescription?: string | null;
  suggestedAssignee?: string | null;
  suggestedTimeEstimate?: number | null;
  suggestedBlockingTasks?: string[] | null;
  suggestedLabels?: string[] | null;
  reasoning?: string;
}

export const useAISuggestions = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [enhancedTasks, setEnhancedTasks] = useState<EnhancedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeTasks = async (tasks: Task[]): Promise<EnhancedTask[]> => {
    if (!tasks || tasks.length === 0) {
      setError('No tasks to analyze');
      return tasks as EnhancedTask[];
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      toast({
        title: "Analyzing tasks with AI",
        description: "This may take a few moments...",
      });

      // Call the Supabase edge function to process tasks
      const { data, error } = await supabase.functions.invoke('process-task-enhancements', {
        body: { tasks }
      });

      if (error) {
        console.error('Error analyzing tasks:', error);
        setError(`Failed to analyze tasks: ${error.message}`);
        toast({
          title: "Error analyzing tasks",
          description: "There was a problem analyzing your tasks with AI. Using original tasks instead.",
          variant: "destructive"
        });
        return tasks as EnhancedTask[];
      }

      // Process the response to extract suggestions
      const processedTasks = data.tasks || [];
      
      if (processedTasks.length === 0) {
        setError('No suggestions returned from AI');
        return tasks as EnhancedTask[];
      }

      // Store the enhanced tasks
      setEnhancedTasks(processedTasks);

      // Extract suggestions from enhanced tasks
      const extractedSuggestions: TaskSuggestion[] = [];
      
      processedTasks.forEach((task: EnhancedTask) => {
        // Collect suggestions for each field
        const fieldMappings: { original: keyof Task, suggested: keyof EnhancedTask }[] = [
          { original: 'dueDate', suggested: 'suggestedDueDate' },
          { original: 'startDate', suggested: 'suggestedStartDate' },
          { original: 'priority', suggested: 'suggestedPriority' },
          { original: 'description', suggested: 'suggestedDescription' },
          { original: 'assignee', suggested: 'suggestedAssignee' },
          { original: 'timeEstimate', suggested: 'suggestedTimeEstimate' },
          { original: 'labels', suggested: 'suggestedLabels' }
        ];

        fieldMappings.forEach(({ original, suggested }) => {
          if (task[suggested] && (!task[original] || task[original] === null || (original === 'description' && task[suggested] !== task[original]))) {
            extractedSuggestions.push({
              taskId: task.id,
              field: original,
              currentValue: task[original],
              suggestedValue: task[suggested],
              reasoning: task.reasoning || `AI suggests a ${String(original)} for this task.`,
              applied: false
            });
          }
        });
      });

      setSuggestions(extractedSuggestions);

      toast({
        title: "AI Analysis Complete",
        description: `Found ${extractedSuggestions.length} suggestions to improve your tasks.`,
      });

      return processedTasks;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error in analyzeTasks:', errorMessage);
      setError(errorMessage);

      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your tasks. Using original tasks instead.",
        variant: "destructive"
      });

      return tasks as EnhancedTask[];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestionId: number, apply: boolean = true) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map((suggestion, idx) => 
        idx === suggestionId ? { ...suggestion, applied: apply } : suggestion
      )
    );
  };

  const applyAllSuggestions = (apply: boolean = true) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(suggestion => ({ ...suggestion, applied: apply }))
    );
  };

  const getUpdatedTasks = (originalTasks: Task[]): Task[] => {
    // Create a map of original tasks by ID for easier lookup
    const tasksMap = new Map<string, Task>();
    originalTasks.forEach(task => tasksMap.set(task.id, { ...task }));

    // Apply all accepted suggestions
    suggestions
      .filter(suggestion => suggestion.applied)
      .forEach(suggestion => {
        const task = tasksMap.get(suggestion.taskId);
        if (task) {
          // Apply the suggestion to the task
          (task[suggestion.field] as any) = suggestion.suggestedValue;
        }
      });

    // Convert the map back to an array
    return Array.from(tasksMap.values());
  };

  return {
    isAnalyzing,
    suggestions,
    enhancedTasks,
    error,
    analyzeTasks,
    applySuggestion,
    applyAllSuggestions,
    getUpdatedTasks
  };
};
