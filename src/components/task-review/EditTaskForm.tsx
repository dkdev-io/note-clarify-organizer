
import React from 'react';
import { Task } from '@/utils/parser';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TrashIcon, User2Icon } from 'lucide-react';

interface EditTaskFormProps {
  task: Task;
  onSave: () => void;
  onUpdateTask: (taskId: string, field: keyof Task, value: any) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSave, onUpdateTask }) => {
  const clearAssignee = () => {
    onUpdateTask(task.id, 'assignee', null);
  };

  return (
    <div className="space-y-4 bg-accent/30 p-3 rounded-md -mx-3">
      <div>
        <Label htmlFor={`title-${task.id}`} className="text-sm font-medium mb-1 block">
          Task Title
        </Label>
        <Input 
          id={`title-${task.id}`}
          value={task.title}
          onChange={(e) => onUpdateTask(task.id, 'title', e.target.value)}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor={`description-${task.id}`} className="text-sm font-medium mb-1 block">
          Description (Optional)
        </Label>
        <Textarea 
          id={`description-${task.id}`}
          value={task.description || ''}
          onChange={(e) => onUpdateTask(task.id, 'description', e.target.value)}
          className="w-full resize-none"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`priority-${task.id}`} className="text-sm font-medium mb-1 block">
            Priority
          </Label>
          <Select 
            value={task.priority || 'normal'}
            onValueChange={(value) => onUpdateTask(task.id, 'priority', value)}
          >
            <SelectTrigger id={`priority-${task.id}`} className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`assignee-${task.id}`} className="text-sm font-medium mb-1 block">
            Assignee (Optional)
          </Label>
          <div className="flex gap-2">
            <Input 
              id={`assignee-${task.id}`}
              value={task.assignee || ''}
              onChange={(e) => onUpdateTask(task.id, 'assignee', e.target.value || null)}
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
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">
          Due Date (Optional)
        </Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !task.dueDate && "text-muted-foreground"
                )}
              >
                {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={(date) => onUpdateTask(task.id, 'dueDate', date?.toISOString() || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {task.dueDate && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onUpdateTask(task.id, 'dueDate', null)}
              className="h-8 px-2"
            >
              <TrashIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
