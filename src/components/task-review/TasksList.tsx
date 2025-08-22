
import React from 'react';
import { Task } from '@/utils/parser';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon, Calendar, CheckCircleIcon, FlagIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import TaskEditForm from './TaskEditForm';

interface TasksListProps {
  tasks: Task[];
  editingTaskId: string | null;
  onEditTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, field: keyof Task | 'deleted', value: any) => void;
  onSaveEdit: () => void;
  onAddTask: () => void;
  apiProps?: any;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  editingTaskId,
  onEditTask,
  onUpdateTask,
  onSaveEdit,
  onAddTask,
  apiProps
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <CardContent className="pt-6 pb-8">
        <div className="text-center">
          <div className="h-20 w-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to review</h3>
          <p className="text-muted-foreground mb-6">
            Task extraction didn't find any tasks in your notes. Try adding more details or using keywords like "todo" or bullet points.
          </p>
          <Button onClick={onAddTask}>
            Add Task Manually
          </Button>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="px-4 py-3">
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <div key={task.id} className="py-4 first:pt-0 last:pb-0">
            {editingTaskId === task.id ? (
              <TaskEditForm 
                task={task}
                onSave={onSaveEdit}
                onUpdate={(field, value) => onUpdateTask(task.id, field, value)}
                apiProps={apiProps}
              />
            ) : (
              <div className="flex items-start justify-between group">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.dueDate && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </Badge>
                    )}
                    {task.priority && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          task.priority === 'high' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : task.priority === 'medium' 
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                              : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <FlagIcon className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                    )}
                    {task.assignee && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                      <UserIcon className="h-3 w-3 mr-1" />
                      {task.assignee}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditTask(task.id)}
                  className="h-8 w-8 p-0"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onUpdateTask(task.id, 'deleted' as 'deleted', true)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default TasksList;
