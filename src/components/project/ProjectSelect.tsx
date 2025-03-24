
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { getProjectsForDropdown, createProject } from '@/utils/motion';
import ProjectDropdown from './ProjectDropdown';
import ProjectActions from './ProjectActions';
import ProjectMessages from './ProjectMessages';
import CreateProjectDialog from '../motion-connect/CreateProjectDialog';

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
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (workspaceId) {
      setProjects([]);
      setSelectedProjectId(null);
      loadProjects();
    }
  }, [workspaceId]);

  const loadProjects = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const projectOptions = await getProjectsForDropdown(workspaceId, apiKey);
      console.log('Loaded projects:', projectOptions);
      setProjects(projectOptions);
      
      if (projectOptions.length > 0 && !selectedProject) {
        onProjectSelect(projectOptions[0].label, projectOptions[0].value);
        setSelectedProjectId(projectOptions[0].value);
      } else if (selectedProject && projectOptions.length > 0) {
        const matchingProject = projectOptions.find(p => p.label === selectedProject);
        if (matchingProject) {
          setSelectedProjectId(matchingProject.value);
          onProjectSelect(matchingProject.label, matchingProject.value);
        }
      } else if (projectOptions.length === 0) {
        onProjectSelect('', undefined);
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      
      let errorMessage = "Failed to load projects from Motion API.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Failed to load projects",
        description: errorMessage,
        variant: "destructive"
      });
      
      onProjectSelect('', undefined);
      setSelectedProjectId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = (projectName: string, projectId: string) => {
    // Add the new project to the list
    const newProject = {
      label: projectName,
      value: projectId
    };
    
    setProjects([...projects, newProject]);
    onProjectSelect(projectName, projectId);
    setSelectedProjectId(projectId);
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.value === projectId);
    if (project) {
      onProjectSelect(project.label, project.value);
      setSelectedProjectId(projectId);
    }
  };

  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const project = projects.find(p => p.label === selectedProject);
      if (project) {
        setSelectedProjectId(project.value);
      } else {
        onProjectSelect('', undefined);
        setSelectedProjectId(null);
      }
    }
  }, [selectedProject, projects]);

  if (!apiKey || !workspaceId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <ProjectDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            isLoading={isLoading}
          />
          <ProjectActions
            onRefresh={loadProjects}
            onCreateNew={() => setShowNewProjectDialog(true)}
            isLoading={isLoading}
          />
        </div>
        
        <ProjectMessages
          error={error}
          isLoading={isLoading}
          projectsCount={projects.length}
        />
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showNewProjectDialog}
        workspaceId={workspaceId || ''}
        apiKey={apiKey}
        onClose={() => setShowNewProjectDialog(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectSelect;
