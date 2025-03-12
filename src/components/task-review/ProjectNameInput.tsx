
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectNameInputProps {
  projectName: string | null;
  onChange: (value: string | null) => void;
}

const ProjectNameInput: React.FC<ProjectNameInputProps> = ({ projectName, onChange }) => {
  return (
    <div className="mt-4 flex items-center gap-3">
      <Label htmlFor="project-name" className="text-sm font-medium">Project Name:</Label>
      <Input 
        id="project-name"
        value={projectName || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-8 max-w-[250px]"
        placeholder="No project (optional)"
      />
    </div>
  );
};

export default ProjectNameInput;
