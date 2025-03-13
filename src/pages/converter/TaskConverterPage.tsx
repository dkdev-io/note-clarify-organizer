import React, { useState } from 'react';
import { Task } from '@/utils/parser';
import { Step, ApiProps } from './types';
import { useToast } from "@/components/ui/use-toast";
import TaskConverterHeader from './components/TaskConverterHeader';
import TaskConverterStepMarkers from './components/TaskConverterStepMarkers';
import TaskConverterContent from './components/TaskConverterContent';
import CompletionScreen from './components/CompletionScreen';

const TaskConverterPage = () => {
  const [step, setStep] = useState<Step>('connect');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [processedTasks, setProcessedTasks] = useState<Task[]>([]);
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Motion API connection state
  const [motionApiKey, setMotionApiKey] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  
  // Handle API connection
  const handleApiConnect = (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string) => {
    setMotionApiKey(apiKey);
    setWorkspaces(fetchedWorkspaces);
    setSelectedWorkspaceId(workspaceId);
    setSelectedProject(project);
    setProjectName(project || null);
    setIsConnected(true);
    setStep('input');
  };

  // Handle skipping API connection
  const handleSkipConnect = () => {
    setIsConnected(false);
    setStep('input');
  };

  // Handle moving from note input to task extraction
  const handleParseText = (text: string, providedProjectName: string | null) => {
    setNoteText(text);
    
    // Use the selected project from Motion API if available, otherwise use provided name
    const effectiveProjectName = selectedProject || providedProjectName;
    
    const tasks = parseTextIntoTasks(text, effectiveProjectName);
    
    // Extract project name from tasks if not provided
    const extractedProjectName = tasks.find(task => task.project)?.project || effectiveProjectName || null;
    setProjectName(extractedProjectName);
    
    // If connected to API, enhance tasks with workspace IDs
    if (isConnected && selectedWorkspaceId) {
      const tasksWithWorkspace = tasks.map(task => ({
        ...task,
        workspace_id: selectedWorkspaceId,
        project: extractedProjectName || task.project
      }));
      setExtractedTasks(tasksWithWorkspace);
    } else {
      setExtractedTasks(tasks);
    }
    
    setStep('extract');
  };

  // Handle moving from extraction to LLM processing
  const handleContinueToProcess = (tasks: Task[]) => {
    setSelectedTasks(tasks);
    setStep('process');
  };

  // Handle moving from LLM processing to review
  const handleContinueToReview = (tasks: Task[]) => {
    setProcessedTasks(tasks);
    setStep('review');
  };

  // Handle moving from review to preview
  const handleContinueToPreview = (tasks: Task[], updatedProjectName?: string) => {
    if (updatedProjectName) {
      setProjectName(updatedProjectName);
      // Update all tasks with the project name
      const updatedTasks = tasks.map(task => ({
        ...task,
        project: updatedProjectName
      }));
      setReviewedTasks(updatedTasks);
    } else {
      setReviewedTasks(tasks);
    }
    setStep('preview');
  };

  // Handle completion of the workflow
  const handleComplete = () => {
    setStep('complete');
    toast({
      title: "Success!",
      description: `${reviewedTasks.length} tasks have been added to Motion${projectName ? ` under project '${projectName}'` : ''}.`,
    });
  };

  // Handle starting over
  const handleStartOver = () => {
    setNoteText('');
    setExtractedTasks([]);
    setSelectedTasks([]);
    setProcessedTasks([]);
    setReviewedTasks([]);
    // Keep project and workspace if connected to API
    if (!isConnected) {
      setProjectName(null);
    }
    // Keep API connection but return to input step
    setStep('input');
  };

  // Reconnect to Motion API
  const handleReconnect = () => {
    setStep('connect');
  };

  // Create API props object to pass to components
  const apiProps: ApiProps = {
    isConnected,
    apiKey: motionApiKey,
    workspaces,
    selectedWorkspaceId,
    selectedProject
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <TaskConverterHeader 
          isConnected={isConnected} 
          step={step} 
          workspaces={workspaces} 
          selectedWorkspaceId={selectedWorkspaceId} 
          selectedProject={selectedProject}
        />

        {step !== 'complete' && (
          <TaskConverterStepMarkers 
            step={step} 
            isConnected={isConnected} 
          />
        )}
        
        <main className="flex-1">
          {step === 'complete' ? (
            <CompletionScreen 
              reviewedTasks={reviewedTasks}
              projectName={projectName}
              isConnected={isConnected}
              onStartOver={handleStartOver}
              onReconnect={handleReconnect}
            />
          ) : (
            <TaskConverterContent 
              step={step}
              noteText={noteText}
              projectName={projectName}
              extractedTasks={extractedTasks}
              selectedTasks={selectedTasks}
              processedTasks={processedTasks}
              reviewedTasks={reviewedTasks}
              apiProps={apiProps}
              onApiConnect={handleApiConnect}
              onSkipConnect={handleSkipConnect}
              onParseText={handleParseText}
              onContinueToProcess={handleContinueToProcess}
              onContinueToReview={handleContinueToReview}
              onContinueToPreview={handleContinueToPreview}
              onComplete={handleComplete}
              onBackToExtract={() => setStep('extract')}
              onBackToProcess={() => setStep('process')}
              onBackToReview={() => setStep('review')}
              onBackToInput={() => setStep('input')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Import only here to avoid circular dependencies
import { parseTextIntoTasks } from '@/utils/parser';

export default TaskConverterPage;
