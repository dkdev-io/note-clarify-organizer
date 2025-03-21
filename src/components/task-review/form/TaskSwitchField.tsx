
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TaskSwitchFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const TaskSwitchField: React.FC<TaskSwitchFieldProps> = ({
  id,
  label,
  checked,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default TaskSwitchField;
