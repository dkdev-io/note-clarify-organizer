
import React from 'react';
import { Task } from '@/utils/task-parser/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, TrashIcon, User2Icon, TagIcon, Clock3Icon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

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
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg -mx-3">
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
            value={task.priority || 'medium'}
            onValueChange={(value) => onUpdateTask(task.id, 'priority', value)}
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1 block">
            Start Date (Optional)
          </Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !task.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.startDate ? format(new Date(task.startDate), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.startDate ? new Date(task.startDate) : undefined}
                  onSelect={(date) => onUpdateTask(task.id, 'startDate', date?.toISOString() || null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            {task.startDate && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onUpdateTask(task.id, 'startDate', null)}
                className="h-10 w-10"
              >
                <TrashIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={(date) => onUpdateTask(task.id, 'dueDate', date?.toISOString() || null)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            {task.dueDate && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onUpdateTask(task.id, 'dueDate', null)}
                className="h-10 w-10"
              >
                <TrashIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`hard-deadline-${task.id}`} className="text-sm font-medium">
            Hard Deadline
          </Label>
          <Switch
            id={`hard-deadline-${task.id}`}
            checked={task.hardDeadline || false}
            onCheckedChange={(checked) => onUpdateTask(task.id, 'hardDeadline', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor={`auto-scheduled-${task.id}`} className="text-sm font-medium">
            Auto-scheduled
          </Label>
          <Switch
            id={`auto-scheduled-${task.id}`}
            checked={task.autoScheduled !== false}
            onCheckedChange={(checked) => onUpdateTask(task.id, 'autoScheduled', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor={`pending-${task.id}`} className="text-sm font-medium">
            Pending
          </Label>
          <Switch
            id={`pending-${task.id}`}
            checked={task.isPending || false}
            onCheckedChange={(checked) => onUpdateTask(task.id, 'isPending', checked)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor={`duration-${task.id}`} className="text-sm font-medium mb-1 block">
          Duration
        </Label>
        <div className="flex items-center gap-2">
          <Select 
            value={task.duration || '15 min'}
            onValueChange={(value) => onUpdateTask(task.id, 'duration', value)}
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
      </div>
      
      <div>
        <Label htmlFor={`schedule-${task.id}`} className="text-sm font-medium mb-1 block">
          Schedule
        </Label>
        <Select 
          value={task.schedule || 'Work hours'}
          onValueChange={(value) => onUpdateTask(task.id, 'schedule', value)}
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
      </div>
      
      <div>
        <Label htmlFor={`folder-${task.id}`} className="text-sm font-medium mb-1 block">
          Folder
        </Label>
        <Input 
          id={`folder-${task.id}`}
          value={task.folder || ''}
          onChange={(e) => onUpdateTask(task.id, 'folder', e.target.value || null)}
          placeholder="No folder"
        />
      </div>
      
      <div>
        <Label htmlFor={`labels-${task.id}`} className="text-sm font-medium mb-1 block flex items-center">
          <TagIcon className="h-4 w-4 mr-1" /> Labels (comma separated)
        </Label>
        <Input 
          id={`labels-${task.id}`}
          value={task.labels ? task.labels.join(', ') : ''}
          onChange={(e) => {
            const labelsText = e.target.value;
            const labels = labelsText.split(',').map(label => label.trim()).filter(Boolean);
            onUpdateTask(task.id, 'labels', labels.length > 0 ? labels : null);
          }}
          placeholder="Add labels separated by commas"
        />
      </div>
      
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
