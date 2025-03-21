
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User2Icon, Clock3Icon } from 'lucide-react';
import TaskFormField from './TaskFormField';

interface TaskMetadataFieldsProps {
  task: Task;
  onUpdateTask: (field: keyof Task, value: any) => void;
}

const TaskMetadataFields: React.FC<TaskMetadataFieldsProps> = ({
  task,
  onUpdateTask
}) => {
  const clearAssignee = () => {
    onUpdateTask('assignee', null);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <TaskFormField id={`priority-${task.id}`} label="Priority">
        <Select 
          value={task.priority || 'medium'}
          onValueChange={(value) => onUpdateTask('priority', value)}
        >
          <SelectTrigger id={`priority-${task.id}`} className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </TaskFormField>
      
      <TaskFormField id={`assignee-${task.id}`} label="Assignee (Optional)">
        <div className="flex gap-2">
          <Input 
            id={`assignee-${task.id}`}
            value={task.assignee || ''}
            onChange={(e) => onUpdateTask('assignee', e.target.value || null)}
            className="w-full"
            placeholder="Assignee name"
          />
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10"
            onClick={clearAssignee}
            type="button"
            title="Remove assignment"
          >
            <User2Icon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </TaskFormField>
    </div>
  );
};

export default TaskMetadataFields;
