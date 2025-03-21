
import React from 'react';
import { Task } from '@/utils/parser';
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from 'lucide-react';
import TaskItem from './TaskItem';
import EditTaskForm from './EditTaskForm';

interface TasksListProps {
  tasks: Task[];
  editingTaskId: string | null;
  isLoading: boolean;
  onEditTask: (taskId: string) => void;
  onSaveTask: () => void;
  onUpdateTask: (taskId: string, field: keyof Task, value: any) => void;
  onDeleteTask: (taskId: string) => void;
  onBack: () => void;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  editingTaskId,
  isLoading,
  onEditTask,
  onSaveTask,
  onUpdateTask,
  onDeleteTask,
  onBack
}) => {
  if (isLoading) {
    return (
      <CardContent className="pb-0">
        <div className="space-y-4 py-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="pt-0.5">
                <div className="h-5 w-5 rounded-full border border-gray-300 bg-white"></div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (tasks.length === 0) {
    return (
      <CardContent className="pb-0">
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No tasks to review. Go back to add some tasks.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="pb-0">
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <div key={task.id}>
            {editingTaskId === task.id ? (
              <EditTaskForm
                task={task}
                onSave={onSaveTask}
                onUpdateTask={onUpdateTask}
              />
            ) : (
              <TaskItem
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            )}
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default TasksList;
