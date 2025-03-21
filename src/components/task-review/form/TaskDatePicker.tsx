
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, TrashIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDatePickerProps {
  label: string;
  date: string | null;
  onSelect: (date: Date | null) => void;
  onClear: () => void;
}

const TaskDatePicker: React.FC<TaskDatePickerProps> = ({
  label,
  date,
  onSelect,
  onClear
}) => {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(new Date(date), "PPP") : `Select ${label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={(selectedDate) => onSelect(selectedDate)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      
      {date && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClear}
          className="h-10 w-10"
          title={`Clear ${label.toLowerCase()}`}
        >
          <TrashIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};

export default TaskDatePicker;
