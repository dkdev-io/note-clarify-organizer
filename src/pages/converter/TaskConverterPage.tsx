
import React, { useState, useEffect } from 'react';
import { Task } from '@/utils/task-parser/types';
import { Step, ApiProps } from './types';
import { useToast } from "@/components/ui/use-toast";
import TaskConverterHeader from './components/TaskConverterHeader';
import TaskConverterStepMarkers from './components/TaskConverterStepMarkers';
import TaskConverterContent from './components/TaskConverterContent';
import CompletionScreen from './components/CompletionScreen';
import MotionApiConnect from '@/components/MotionApiConnect';
import { parseTextIntoTasks } from '@/utils/task-parser';
import TaskAIEnhancer from '@/components/task-review/TaskAIEnhancer';
import TaskReview from '@/components/task-review/TaskReviewWrapper';
import TaskExtractor from '@/components/TaskExtractor';

const TaskConverterPage = () => {
  const [step, setStep] = useState<Step>('connect');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [enhancedTasks, setEnhancedTasks] = useState<Task[]>([]);
  const [processedTasks, setProcessedTasks] = useState<Task[]>([]);
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Motion API connection state
  const [motionApiKey, setMotionApiKey] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Debug logging for task flow
  useEffect(() => {
    if (extractedTasks && extractedTasks.length > 0) {
      console.log('TaskConverterPage - extractedTasks updated:', extractedTasks);
    }
  }, [extractedTasks]);
  
  // Handle API connection
  const handleApiConnect = (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string, users?: any[]) => {
    console.log('TaskConverterPage - handleApiConnect called with:', { apiKey, fetchedWorkspaces, workspaceId, project, users });
    setMotionApiKey(apiKey);
    setWorkspaces(fetchedWorkspaces);
    setSelectedWorkspaceId(workspaceId || null);
    setSelectedProject(project || null);
    setProjectName(project || null);
    setUsers(users || []);
    setIsConnected(true);
    setStep('input');
    console.log('TaskConverterPage - step set to input');
  };

  // Handle skipping API connection
  const handleSkipConnect = () => {
    setIsConnected(false);
    setStep('input');
  };

  // Handle moving from note input to task extraction
  const handleParseText = (text: string, providedProjectName: string | null) => {
    console.log('=== TaskConverterPage.handleParseText called ===');
    console.log('Text:', text);
    console.log('Provided project name:', providedProjectName);
    
    setNoteText(text);
    
    // Use the selected project from Motion API if available, otherwise use provided name
    const effectiveProjectName = selectedProject || providedProjectName;
    console.log('Effective project name:', effectiveProjectName);
    
    try {
      const tasks = parseTextIntoTasks(text, effectiveProjectName);
      console.log('Tasks after parsing:', tasks); // Debug log
      
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
      
      console.log('Setting step to extract');
      setStep('extract');
      
      toast({
        title: "Tasks extracted",
        description: `Successfully extracted ${tasks.length} tasks from your notes.`,
      });
    } catch (error) {
      console.error('Error in TaskConverterPage.handleParseText:', error);
      toast({
        title: "Error extracting tasks", 
        description: "There was a problem processing your notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle moving from extraction to AI enhancement
  const handleContinueToEnhance = (tasks: Task[]) => {
    console.log('Continuing to enhance with tasks:', tasks); // Debug log
    setSelectedTasks(tasks);
    setStep('enhance');
  };

  // Handle moving from AI enhancement to review
  const handleContinueToReview = (tasks: Task[]) => {
    setEnhancedTasks(tasks);
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
    setEnhancedTasks([]);
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
    users,
    selectedWorkspaceId,
    selectedProject,
    selectedProjectId
  };

  // Render the appropriate content based on step
  const renderStepContent = () => {
    switch (step) {
      case 'connect':
        return (
          <MotionApiConnect
            onConnect={handleApiConnect}
            onSkip={handleSkipConnect}
          />
        );
      case 'input':
        return (
          <TaskConverterContent onParseText={handleParseText} />
        );
      case 'extract':
        console.log('Rendering extract step with tasks:', extractedTasks); // Debug log
        return (
          <TaskExtractor
            rawText={noteText}
            extractedTasks={extractedTasks}
            projectName={projectName}
            onBack={() => setStep('input')}
            onContinue={handleContinueToEnhance}
            apiProps={apiProps}
          />
        );
      case 'enhance':
        return (
          <TaskAIEnhancer
            tasks={selectedTasks}
            onBack={() => setStep('extract')}
            onContinue={handleContinueToReview}
          />
        );
      case 'review':
        return (
          <TaskReview
            tasks={enhancedTasks}
            projectName={projectName}
            onBack={() => setStep('enhance')}
            onContinue={handleContinueToPreview}
            apiProps={apiProps}
          />
        );
      case 'complete':
        return (
          <CompletionScreen
            reviewedTasks={reviewedTasks}
            projectName={projectName}
            isConnected={isConnected}
            onStartOver={handleStartOver}
            onReconnect={handleReconnect}
          />
        );
      default:
        return (
          <TaskConverterContent onParseText={handleParseText} />
        );
    }
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
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
};

export default TaskConverterPage;
