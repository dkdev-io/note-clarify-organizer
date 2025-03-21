
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TaskFormField from './TaskFormField';

interface TaskBasicFieldsProps {
  task: Task;
  onUpdateTask: (field: keyof Task, value: any) => void;
}

const TaskBasicFields: React.FC<TaskBasicFieldsProps> = ({
  task,
  onUpdateTask
}) => {
  return (
    <>
      <TaskFormField id={`title-${task.id}`} label="Task Title">
        <Input 
          id={`title-${task.id}`}
          value={task.title}
          onChange={(e) => onUpdateTask('title', e.target.value)}
          className="w-full"
        />
      </TaskFormField>
      
      <TaskFormField id={`description-${task.id}`} label="Description (Optional)">
        <Textarea 
          id={`description-${task.id}`}
          value={task.description || ''}
          onChange={(e) => onUpdateTask('description', e.target.value)}
          className="w-full resize-none"
          rows={2}
        />
      </TaskFormField>
    </>
  );
};

export default TaskBasicFields;
