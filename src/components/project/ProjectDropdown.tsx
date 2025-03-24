
import React from 'react';
import { Label } from "@/components/ui/label";
import { LoaderIcon, PlusCircle } from "lucide-react";
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
  onCreateNewProject: () => void;
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  isLoading,
  onCreateNewProject
}) => {
  return (
    <div className="relative flex-1">
      <Label htmlFor="project" className="mb-2 block">Select Project</Label>
      <Select
        value={selectedProjectId || undefined}
        onValueChange={(value) => {
          if (value === "create-new") {
            onCreateNewProject();
          } else {
            onSelectProject(value);
          }
        }}
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
        <SelectContent className="bg-white z-50">
          <SelectGroup>
            <SelectLabel>Projects</SelectLabel>
            {projects.map(project => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
            <SelectItem value="create-new" className="text-primary font-medium">
              <div className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Project
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectDropdown;
