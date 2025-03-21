
import React from 'react';
import { Button } from "@/components/ui/button";
import { Task } from '@/utils/task-parser/types';
import TaskItem from './TaskItem';
import { PlusCircleIcon, AlertCircleIcon } from 'lucide-react';

interface TasksListProps {
  tasks: Task[];
  editingTaskId?: string | null;
  onEditTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, field: keyof Task, value: any) => void;
  onSaveEdit: () => void;
  onAddTask?: () => void;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  editingTaskId = null,
  onEditTask,
  onUpdateTask,
  onSaveEdit,
  onAddTask,
}) => {
  // Empty state rendering
  if (tasks.length === 0) {
    return (
      <div className="py-8 px-4 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircleIcon className="h-6 w-6 text-amber-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">No tasks to review</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Task extraction didn't find any tasks in your notes. Try adding more details or using keywords like "todo" or bullet points.
          </p>
        </div>
        
        {onAddTask && (
          <Button 
            onClick={onAddTask} 
            variant="outline" 
            className="mt-4"
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Add Task Manually
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingTaskId === task.id}
          onEdit={() => onEditTask(task.id)}
          onSave={onSaveEdit}
          onUpdateTask={(field, value) => onUpdateTask(task.id, field, value)}
        />
      ))}
      
      {onAddTask && (
        <div className="py-4 px-4 text-center">
          <Button 
            onClick={onAddTask} 
            variant="outline" 
            className="w-full border-dashed"
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Add Another Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksList;
