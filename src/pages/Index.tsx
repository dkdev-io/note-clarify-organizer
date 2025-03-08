
import React, { useState } from 'react';
import NoteInput from '@/components/NoteInput';
import TaskExtractor from '@/components/TaskExtractor';
import TaskReview from '@/components/TaskReview';
import TaskPreview from '@/components/TaskPreview';
import { Task, parseTextIntoTasks } from '@/utils/parser';
import { CheckIcon, ClipboardIcon, ArrowRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

// Define application steps
type Step = 'input' | 'extract' | 'review' | 'preview' | 'complete';

const Index = () => {
  const [step, setStep] = useState<Step>('input');
  const [noteText, setNoteText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle moving from note input to task extraction
  const handleParseText = (text: string, providedProjectName: string | null) => {
    setNoteText(text);
    setProjectName(providedProjectName);
    const tasks = parseTextIntoTasks(text, providedProjectName);
    setExtractedTasks(tasks);
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
    setStep('input');
  };

  // Render step markers at the top
  const renderStepMarkers = () => {
    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
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
            const isCompleted = index < currentStepIndex || step === 'complete';
            const isCurrent = s.key === step;
            
            return (
              <React.Fragment key={s.key}>
                {index > 0 && (
                  <div 
                    className={`h-[1px] w-10 mx-1 ${
                      isCompleted ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
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
      <button 
        onClick={handleStartOver}
        className="mt-8 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Start Over
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Note to Task Converter</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Transform your meeting notes into structured tasks for Motion
          </p>
        </header>

        {step !== 'complete' && renderStepMarkers()}
        
        <main className="flex-1">
          {step === 'input' && (
            <NoteInput onParseTasks={handleParseText} />
          )}
          
          {step === 'extract' && (
            <TaskExtractor 
              rawText={noteText}
              extractedTasks={extractedTasks}
              projectName={projectName}
              onBack={() => setStep('input')}
              onContinue={handleContinueToReview}
            />
          )}
          
          {step === 'review' && (
            <TaskReview 
              tasks={selectedTasks}
              projectName={projectName}
              onBack={() => setStep('extract')}
              onContinue={handleContinueToPreview}
            />
          )}
          
          {step === 'preview' && (
            <TaskPreview 
              tasks={reviewedTasks}
              projectName={projectName}
              onBack={() => setStep('review')}
              onComplete={handleComplete}
            />
          )}
          
          {step === 'complete' && renderComplete()}
        </main>
      </div>
    </div>
  );
};

export default Index;
