
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import TaskSwitchField from './TaskSwitchField';
import TaskFormSection from './TaskFormSection';

interface TaskOptionsFieldsProps {
  task: Task;
  onUpdateTask: (field: keyof Task, value: any) => void;
}

const TaskOptionsFields: React.FC<TaskOptionsFieldsProps> = ({
  task,
  onUpdateTask
}) => {
  return (
    <TaskFormSection className="space-y-2">
      <TaskSwitchField
        id={`hard-deadline-${task.id}`}
        label="Hard Deadline"
        checked={task.hardDeadline || false}
        onChange={(checked) => onUpdateTask('hardDeadline', checked)}
      />
      
      <TaskSwitchField
        id={`auto-scheduled-${task.id}`}
        label="Auto-scheduled"
        checked={task.autoScheduled !== false}
        onChange={(checked) => onUpdateTask('autoScheduled', checked)}
      />
      
      <TaskSwitchField
        id={`pending-${task.id}`}
        label="Pending"
        checked={task.isPending || false}
        onChange={(checked) => onUpdateTask('isPending', checked)}
      />
    </TaskFormSection>
  );
};

export default TaskOptionsFields;
