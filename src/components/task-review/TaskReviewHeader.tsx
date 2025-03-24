
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare } from 'lucide-react';

interface TaskReviewHeaderProps {
  tasksCount: number;
  projectName: string | null;
  onProjectNameChange: (name: string | null) => void;
  rawText?: string;
}

const TaskReviewHeader: React.FC<TaskReviewHeaderProps> = ({
  tasksCount,
  projectName,
  onProjectNameChange,
  rawText
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <CardTitle>Review Tasks</CardTitle>
          <Badge variant="outline" className="ml-2">
            {tasksCount} task{tasksCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      
      <CardDescription className="mt-1.5">
        Review and edit tasks before adding them to Motion
      </CardDescription>
      
      <div className="mt-4 flex items-center gap-3">
        <Label htmlFor="project-name" className="text-sm font-medium">Project Name:</Label>
        <Input 
          id="project-name"
          value={projectName || ''}
          onChange={(e) => onProjectNameChange(e.target.value || null)}
          className="h-8 max-w-[250px]"
          placeholder="No project (optional)"
        />
      </div>
    </CardHeader>
  );
};

export default TaskReviewHeader;
