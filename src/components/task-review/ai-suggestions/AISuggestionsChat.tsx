
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Bot, UserIcon, CheckIcon, XIcon, Loader2 } from 'lucide-react';
import { Task } from '@/utils/task-parser/types';
import ChatMessage from './ChatMessage';
import TaskSuggestion from './TaskSuggestion';
import { generateSuggestions } from './suggestion-generator';

interface AISuggestionsChatProps {
  tasks: Task[];
  onApplySuggestions: (updatedTasks: Task[]) => void;
  onClose: () => void;
}

type Message = {
  id: string;
  type: 'system' | 'ai' | 'user';
  content: string;
  timestamp: Date;
};

type Suggestion = {
  id: string;
  taskId: string;
  field: keyof Task;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  applied: boolean;
};

const AISuggestionsChat: React.FC<AISuggestionsChatProps> = ({ tasks, onApplySuggestions, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [updatedTasks, setUpdatedTasks] = useState<Task[]>([...tasks]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'system',
        content: 'AI assistant is analyzing your tasks...',
        timestamp: new Date()
      }
    ]);
    
    // Generate suggestions
    const analyzeAndSuggest = async () => {
      try {
        setIsProcessing(true);
        
        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate suggestions using our utility
        const { suggestions, updatedMessages } = await generateSuggestions(tasks);
        
        setSuggestions(suggestions);
        setMessages(prevMessages => [
          ...prevMessages,
          ...updatedMessages.map(msg => ({
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: msg.type,
            content: msg.content,
            timestamp: new Date()
          }))
        ]);
      } catch (error) {
        console.error('Error analyzing tasks:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            type: 'system',
            content: 'Sorry, there was an error analyzing your tasks.',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    };
    
    analyzeAndSuggest();
  }, [tasks]);

  const handleApplySuggestion = (suggestionId: string, apply: boolean) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, applied: apply } 
          : suggestion
      )
    );
    
    if (apply) {
      // Find the suggestion
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;
      
      // Update the task with the suggested value
      setUpdatedTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === suggestion.taskId 
            ? { ...task, [suggestion.field]: suggestion.suggestedValue } 
            : task
        )
      );
      
      // Add a message about applying the suggestion
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `apply-${Date.now()}`,
          type: 'system',
          content: `Applied suggestion: ${suggestion.reason}`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleApplyAllSuggestions = () => {
    // Apply all unapplied suggestions
    const unappliedSuggestions = suggestions.filter(s => !s.applied);
    
    // Mark all as applied
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(suggestion => ({ ...suggestion, applied: true }))
    );
    
    // Update all tasks with suggested values
    let newTasks = [...updatedTasks];
    unappliedSuggestions.forEach(suggestion => {
      newTasks = newTasks.map(task => 
        task.id === suggestion.taskId 
          ? { ...task, [suggestion.field]: suggestion.suggestedValue } 
          : task
      );
    });
    
    setUpdatedTasks(newTasks);
    
    // Add a message about applying all suggestions
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: `apply-all-${Date.now()}`,
        type: 'system',
        content: `Applied all ${unappliedSuggestions.length} remaining suggestions.`,
        timestamp: new Date()
      }
    ]);
  };

  const handleFinish = () => {
    onApplySuggestions(updatedTasks);
    onClose();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessage 
                key={message.id}
                message={message}
              />
            ))}
            
            {suggestions.length > 0 && !isProcessing && (
              <>
                <Separator className="my-4" />
                <div className="text-sm font-medium mb-2">Suggested Improvements:</div>
                <div className="space-y-3">
                  {suggestions.map(suggestion => (
                    <TaskSuggestion
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={(apply) => handleApplySuggestion(suggestion.id, apply)}
                    />
                  ))}
                </div>
              </>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="ml-3 text-sm text-muted-foreground">
                  Analyzing your tasks...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 flex justify-between py-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        
        <div className="flex gap-2">
          {suggestions.some(s => !s.applied) && (
            <Button 
              variant="secondary"
              onClick={handleApplyAllSuggestions}
            >
              Apply All Suggestions
            </Button>
          )}
          <Button onClick={handleFinish}>
            Continue with Tasks
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AISuggestionsChat;
