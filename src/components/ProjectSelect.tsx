
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProjectsForDropdown, createProject } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";

interface ProjectSelectProps {
  apiKey: string | null;
  workspaceId: string | null;
  selectedProject: string | null;
  onProjectSelect: (projectName: string, projectId?: string) => void;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  apiKey,
  workspaceId,
  selectedProject,
  onProjectSelect
}) => {
  const [projects, setProjects] = useState<{label: string, value: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey && workspaceId) {
      loadProjects();
    }
  }, [apiKey, workspaceId]);

  const loadProjects = async (query = '') => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      const projectOptions = await getProjectsForDropdown(query, workspaceId);
      setProjects(projectOptions);
      
      // If we have projects and none is selected, select the first one
      if (projectOptions.length > 0 && !selectedProject) {
        onProjectSelect(projectOptions[0].label, projectOptions[0].value);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadProjects(searchQuery);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !workspaceId) return;
    
    setIsCreating(true);
    try {
      const result = await createProject(newProjectName, workspaceId, newProjectDescription);
      
      if (result.success && result.project) {
        const newProject = {
          label: result.project.name,
          value: result.project.id
        };
        
        setProjects([...projects, newProject]);
        onProjectSelect(newProject.label, newProject.value);
        setShowNewProjectForm(false);
        setNewProjectName('');
        setNewProjectDescription('');
        
        toast({
          title: "Project Created",
          description: `Project "${newProject.label}" successfully created.`,
        });
      } else {
        throw new Error(result.error?.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Failed to Create Project",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.value === projectId);
    if (project) {
      onProjectSelect(project.label, project.value);
    }
  };

  if (!apiKey || !workspaceId) {
    return null;
  }

  return (
    <div className="space-y-4">
      {!showNewProjectForm ? (
        <div className="space-y-2">
          <Label htmlFor="project">Select Project</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Select
                value={selectedProject || undefined}
                onValueChange={handleSelectProject}
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
                <SelectContent>
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
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewProjectForm(true)}
                title="Create New Project"
              >
                <PlusCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-end gap-2 mt-2">
            <div className="flex-1">
              <Label htmlFor="searchProject" className="text-xs">Search Projects</Label>
              <Input
                id="searchProject"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="h-9"
              />
            </div>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleSearch}
              disabled={isLoading}
              className="h-9"
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="newProjectName">Project Name</Label>
              <Input
                id="newProjectName"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newProjectDescription">Description (Optional)</Label>
              <Textarea
                id="newProjectDescription"
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows={2}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setShowNewProjectForm(false);
                setNewProjectName('');
                setNewProjectDescription('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ProjectSelect;
