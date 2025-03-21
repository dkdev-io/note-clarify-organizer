
import React from 'react';
import { Input } from "@/components/ui/input";
import TaskFormField from './TaskFormField';
import { TagIcon } from 'lucide-react';

interface TaskLabelsFieldProps {
  id: string;
  labels: string[] | null;
  onChange: (labels: string[] | null) => void;
}

const TaskLabelsField: React.FC<TaskLabelsFieldProps> = ({
  id,
  labels,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const labelsText = e.target.value;
    const newLabels = labelsText.split(',').map(label => label.trim()).filter(Boolean);
    onChange(newLabels.length > 0 ? newLabels : null);
  };

  return (
    <TaskFormField
      id={id}
      label={
        <span className="flex items-center">
          <TagIcon className="h-4 w-4 mr-1" /> Labels (comma separated)
        </span>
      }
    >
      <Input 
        id={id}
        value={labels ? labels.join(', ') : ''}
        onChange={handleChange}
        placeholder="Add labels separated by commas"
      />
    </TaskFormField>
  );
};

export default TaskLabelsField;
