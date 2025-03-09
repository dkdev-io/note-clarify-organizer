import React, { useState } from 'react';
import NoteInput from '@/components/NoteInput';
import TaskExtractor from '@/components/TaskExtractor';
import TaskReview from '@/components/TaskReview';
import TaskPreview from '@/components/TaskPreview';
import MotionApiConnect from '@/components/MotionApiConnect';
import { Task, parseTextIntoTasks } from '@/utils/parser';
import { CheckIcon, ClipboardIcon, ArrowRightIcon, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

// Define application steps
type Step = 'connect' | 'input' | 'extract' | 'review' | 'preview' | 'complete';

const Index = () => {
  const [step, setStep] = useState<Step>('connect');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Motion API connection state
  const [motionApiKey, setMotionApiKey] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Handle API connection
  const handleApiConnect = (apiKey: string, fetchedWorkspaces: any[]) => {
    setMotionApiKey(apiKey);
    setWorkspaces(fetchedWorkspaces);
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
    const tasks = parseTextIntoTasks(text, providedProjectName);
    
    // Extract project name from tasks if not provided
    const extractedProjectName = tasks.find(task => task.project)?.project || null;
    setProjectName(extractedProjectName);
    
    // If connected to API, enhance tasks with workspace IDs
    if (isConnected && workspaces.length > 0) {
      // Default to first workspace for now, can be refined later
      const defaultWorkspaceId = workspaces[0]?.id || null;
      const tasksWithWorkspace = tasks.map(task => ({
        ...task,
        workspace_id: defaultWorkspaceId
      }));
      setExtractedTasks(tasksWithWorkspace);
    } else {
      setExtractedTasks(tasks);
    }
    
    setStep('extract');
  };

  // Handle moving from extraction to review
  const handleContinueToReview = (tasks: Task[]) => {
    setSelectedTasks(tasks);
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
    setReviewedTasks([]);
    setProjectName(null);
    // Keep API connection but return to input step
    setStep('input');
  };

  // Reconnect to Motion API
  const handleReconnect = () => {
    setStep('connect');
  };

  // Render step markers at the top
  const renderStepMarkers = () => {
    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
      { key: 'connect', label: 'Connect API', icon: <LinkIcon className="h-4 w-4" /> },
      { key: 'input', label: 'Input Notes', icon: <ClipboardIcon className="h-4 w-4" /> },
      { key: 'extract', label: 'Extract Tasks', icon: <ArrowRightIcon className="h-4 w-4" /> },
      { key: 'review', label: 'Review', icon: <ArrowRightIcon className="h-4 w-4" /> },
      { key: 'preview', label: 'Add to Motion', icon: <CheckIcon className="h-4 w-4" /> },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center">
          {steps.map((s, index) => {
            // Skip the connect step in the display if we're already connected and past that step
            if (s.key === 'connect' && isConnected && step !== 'connect') return null;
            
            const isCompleted = index < currentStepIndex || step === 'complete';
            const isCurrent = s.key === step;
            
            return (
              <React.Fragment key={s.key}>
                {index > 0 && (
                  // Only show connection lines between visible steps
                  (!(isConnected && (s.key === 'connect' || steps[index-1].key === 'connect') && step !== 'connect')) && (
                    <div 
                      className={`h-[1px] w-10 mx-1 ${
                        isCompleted ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )
                )}
                <div 
                  className={`flex flex-col items-center ${
                    isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'
                  }`}
                >
                  <div 
                    className={`
                      h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? 'bg-primary text-white' 
                        : isCurrent 
                          ? 'bg-accent border border-primary/50 text-primary' 
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    {s.icon}
                  </div>
                  <span 
                    className={`text-xs mt-1 ${
                      isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Render completion screen
  const renderComplete = () => (
    <div className="w-full max-w-md mx-auto text-center animate-fade-in">
      <div className="bg-green-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
        <CheckIcon className="h-10 w-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-medium text-gray-900 mb-2">All Done!</h2>
      <p className="text-muted-foreground mb-6">
        Your tasks have been successfully added to Motion
        {projectName && <span className="font-medium"> under project '{projectName}'</span>}.
      </p>
      <div className="flex justify-center gap-3">
        <Badge 
          className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
        >
          {reviewedTasks.length} Tasks Added
        </Badge>
        {projectName && (
          <Badge 
            className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200"
          >
            Project: {projectName}
          </Badge>
        )}
      </div>
      <div className="mt-8 space-x-4">
        <button 
          onClick={handleStartOver}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Start Over
        </button>
        {!isConnected && (
          <button 
            onClick={handleReconnect}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Connect to Motion API
          </button>
        )}
      </div>
    </div>
  );

  // Pass API connected status and workspaces to other components
  const apiProps = {
    isConnected,
    apiKey: motionApiKey,
    workspaces
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Note to Task Converter</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Transform your meeting notes into structured tasks for Motion
          </p>
          {isConnected && step !== 'connect' && step !== 'complete' && (
            <Badge 
              className="mt-3 px-3 py-1 bg-green-50 text-green-700 border-green-200"
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              Connected to Motion API
            </Badge>
          )}
        </header>

        {step !== 'complete' && renderStepMarkers()}
        
        <main className="flex-1">
          {step === 'connect' && (
            <MotionApiConnect 
              onConnect={handleApiConnect} 
              onSkip={handleSkipConnect} 
            />
          )}
          
          {step === 'input' && (
            <NoteInput 
              onParseTasks={handleParseText} 
              apiProps={apiProps}
            />
          )}
          
          {step === 'extract' && (
            <TaskExtractor 
              rawText={noteText}
              extractedTasks={extractedTasks}
              projectName={projectName}
              onBack={() => setStep('input')}
              onContinue={handleContinueToReview}
              apiProps={apiProps}
            />
          )}
          
          {step === 'review' && (
            <TaskReview 
              tasks={selectedTasks}
              projectName={projectName}
              onBack={() => setStep('extract')}
              onContinue={handleContinueToPreview}
              apiProps={apiProps}
            />
          )}
          
          {step === 'preview' && (
            <TaskPreview 
              tasks={reviewedTasks}
              projectName={projectName}
              onBack={() => setStep('review')}
              onComplete={handleComplete}
              apiProps={apiProps}
            />
          )}
          
          {step === 'complete' && renderComplete()}
        </main>
      </div>
    </div>
  );
};

export default Index;
