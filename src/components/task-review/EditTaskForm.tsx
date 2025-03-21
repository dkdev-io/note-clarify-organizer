
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from "@/components/ui/button";
import TaskBasicFields from './form/TaskBasicFields';
import TaskMetadataFields from './form/TaskMetadataFields';
import TaskScheduleFields from './form/TaskScheduleFields';
import TaskOptionsFields from './form/TaskOptionsFields';
import TaskLabelsField from './form/TaskLabelsField';

interface EditTaskFormProps {
  task: Task;
  onSave: () => void;
  onUpdateTask: (taskId: string, field: keyof Task, value: any) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSave, onUpdateTask }) => {
  const handleUpdateTask = (field: keyof Task, value: any) => {
    onUpdateTask(task.id, field, value);
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg -mx-3">
      {/* Basic Information */}
      <TaskBasicFields task={task} onUpdateTask={handleUpdateTask} />
      
      {/* Priority & Assignee */}
      <TaskMetadataFields task={task} onUpdateTask={handleUpdateTask} />
      
      {/* Dates & Schedule */}
      <TaskScheduleFields task={task} onUpdateTask={handleUpdateTask} />
      
      {/* Task Options */}
      <TaskOptionsFields task={task} onUpdateTask={handleUpdateTask} />
      
      {/* Labels */}
      <TaskLabelsField
        id={`labels-${task.id}`}
        labels={task.labels}
        onChange={(labels) => handleUpdateTask('labels', labels)}
      />
      
      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={onSave}
          className="bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
