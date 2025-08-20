
import React, { useState } from 'react';
import { Task } from '@/utils/parser';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckIcon, XIcon } from 'lucide-react';

interface TaskEditFormProps {
  task: Task;
  onSave: () => void;
  onUpdate: (field: keyof Task, value: any) => void;
  apiProps?: any;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({ 
  task, 
  onSave, 
  onUpdate,
  apiProps
}) => {
  const [date, setDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onUpdate('dueDate', selectedDate ? selectedDate.toISOString() : null);
  };

  const handleClearDate = () => {
    setDate(undefined);
    onUpdate('dueDate', null);
  };

  return (
    <CardContent className="space-y-4 bg-accent/20 px-4 py-4 rounded-md">
      <div>
        <Label htmlFor="title" className="text-sm font-medium mb-1 block">
          Task Title
        </Label>
        <Input 
          id="title"
          value={task.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium mb-1 block">
          Description (Optional)
        </Label>
        <Textarea 
          id="description"
          value={task.description || ''}
          onChange={(e) => onUpdate('description', e.target.value)}
          className="w-full resize-none"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority" className="text-sm font-medium mb-1 block">
            Priority
          </Label>
          <Select 
            value={task.priority || 'none'}
            onValueChange={(value) => onUpdate('priority', value === 'none' ? null : value)}
          >
            <SelectTrigger id="priority" className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="assignee" className="text-sm font-medium mb-1 block">
            Assignee (Optional)
          </Label>
          <Input 
            id="assignee"
            value={task.assignee || ''}
            onChange={(e) => onUpdate('assignee', e.target.value === '' ? null : e.target.value)}
            className="w-full"
            placeholder="Assignee name"
          />
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
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Set due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {date && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClearDate}
              className="h-10 w-10"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button 
          variant="secondary" 
          className="mr-2"
          onClick={onSave}
        >
          <XIcon className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={onSave}>
          <CheckIcon className="mr-2 h-4 w-4" />
          Save Task
        </Button>
      </div>
    </CardContent>
  );
};

export default TaskEditForm;
