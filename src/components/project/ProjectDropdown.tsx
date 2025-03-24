
import React from 'react';
import { Label } from "@/components/ui/label";
import { LoaderIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectDropdownProps {
  projects: {label: string, value: string}[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  isLoading: boolean;
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  isLoading
}) => {
  return (
    <div className="relative flex-1">
      <Label htmlFor="project" className="mb-2 block">Select Project</Label>
      <Select
        value={selectedProjectId || undefined}
        onValueChange={onSelectProject}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          {isLoading ? (
            <div className="flex items-center">
              <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a project" />
          )}
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectLabel>Projects</SelectLabel>
            {projects.map(project => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectDropdown;
