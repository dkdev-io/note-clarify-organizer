
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock3Icon } from 'lucide-react';
import TaskFormField from './TaskFormField';
import TaskDatePicker from './TaskDatePicker';
import TaskFormSection from './TaskFormSection';

interface TaskScheduleFieldsProps {
  task: Task;
  onUpdateTask: (field: keyof Task, value: any) => void;
}

const TaskScheduleFields: React.FC<TaskScheduleFieldsProps> = ({
  task,
  onUpdateTask
}) => {
  return (
    <TaskFormSection>
      <div className="grid grid-cols-2 gap-4">
        <TaskFormField id="start-date" label="Start Date (Optional)">
          <TaskDatePicker
            label="Start Date"
            date={task.startDate}
            onSelect={(date) => onUpdateTask('startDate', date?.toISOString() || null)}
            onClear={() => onUpdateTask('startDate', null)}
          />
        </TaskFormField>
        
        <TaskFormField id="due-date" label="Due Date (Optional)">
          <TaskDatePicker
            label="Due Date"
            date={task.dueDate}
            onSelect={(date) => onUpdateTask('dueDate', date?.toISOString() || null)}
            onClear={() => onUpdateTask('dueDate', null)}
          />
        </TaskFormField>
      </div>
      
      <TaskFormField id={`duration-${task.id}`} label="Duration">
        <div className="flex items-center gap-2">
          <Select 
            value={task.duration || '15 min'}
            onValueChange={(value) => onUpdateTask('duration', value)}
          >
            <SelectTrigger id={`duration-${task.id}`} className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5 min">5 min</SelectItem>
              <SelectItem value="15 min">15 min</SelectItem>
              <SelectItem value="30 min">30 min</SelectItem>
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="2 hours">2 hours</SelectItem>
              <SelectItem value="4 hours">4 hours</SelectItem>
              <SelectItem value="8 hours">8 hours</SelectItem>
            </SelectContent>
          </Select>
          <Clock3Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </TaskFormField>
      
      <TaskFormField id={`schedule-${task.id}`} label="Schedule">
        <Select 
          value={task.schedule || 'Work hours'}
          onValueChange={(value) => onUpdateTask('schedule', value)}
        >
          <SelectTrigger id={`schedule-${task.id}`} className="w-full">
            <SelectValue placeholder="Select schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Work hours">Work hours</SelectItem>
            <SelectItem value="Anytime">Anytime</SelectItem>
            <SelectItem value="Outside work hours">Outside work hours</SelectItem>
          </SelectContent>
        </Select>
      </TaskFormField>
      
      <TaskFormField id={`folder-${task.id}`} label="Folder">
        <Input 
          id={`folder-${task.id}`}
          value={task.folder || ''}
          onChange={(e) => onUpdateTask('folder', e.target.value || null)}
          placeholder="No folder"
        />
      </TaskFormField>
    </TaskFormSection>
  );
};

export default TaskScheduleFields;
