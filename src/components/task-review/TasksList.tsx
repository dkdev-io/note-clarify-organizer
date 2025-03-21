
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { PlusIcon, Bot } from 'lucide-react';
import { Task } from '@/utils/task-parser/types';
import TaskItem from './TaskItem';
import { AISuggestionsChat } from './ai-suggestions';

interface TasksListProps {
  tasks: Task[];
  editingTaskId: string | null;
  onEditTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, field: keyof Task, value: any) => void;
  onSaveEdit: () => void;
  onAddTask: () => void;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  editingTaskId,
  onEditTask,
  onUpdateTask,
  onSaveEdit,
  onAddTask
}) => {
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>(tasks);

  const handleApplySuggestions = (updatedTasks: Task[]) => {
    setSuggestedTasks(updatedTasks);
    // Update the actual tasks in the parent component by calling onUpdateTask for each change
    updatedTasks.forEach(updatedTask => {
      const originalTask = tasks.find(t => t.id === updatedTask.id);
      if (originalTask) {
        // Find all fields that have been changed
        Object.keys(updatedTask).forEach(key => {
          const field = key as keyof Task;
          if (JSON.stringify(updatedTask[field]) !== JSON.stringify(originalTask[field])) {
            onUpdateTask(updatedTask.id, field, updatedTask[field]);
          }
        });
      }
    });
  };

  return (
    <>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Tasks</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAISuggestions(true)}
                className="flex items-center gap-1"
              >
                <Bot className="h-4 w-4" />
                AI Suggestions
              </Button>
              <Button 
                size="sm" 
                onClick={onAddTask}
                className="flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks to review. Add some tasks to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isEditing={task.id === editingTaskId}
                  onEdit={() => onEditTask(task.id)}
                  onSave={onSaveEdit}
                  onUpdateTask={onUpdateTask}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
        <DialogContent className="sm:max-w-3xl p-0" closeButton={false}>
          <AISuggestionsChat
            tasks={tasks}
            onApplySuggestions={handleApplySuggestions}
            onClose={() => setShowAISuggestions(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TasksList;
