
import { Task } from '@/utils/parser';

// Define application steps
export type Step = 'connect' | 'input' | 'extract' | 'process' | 'review' | 'preview' | 'complete';

// Define interface for API props that will be passed to components
export interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
}

// Define interface for the App context
export interface AppContextType {
  step: Step;
  setStep: (step: Step) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  extractedTasks: Task[];
  setExtractedTasks: (tasks: Task[]) => void;
  selectedTasks: Task[];
  setSelectedTasks: (tasks: Task[]) => void;
  processedTasks: Task[];
  setProcessedTasks: (tasks: Task[]) => void;
  reviewedTasks: Task[];
  setReviewedTasks: (tasks: Task[]) => void;
  projectName: string | null;
  setProjectName: (name: string | null) => void;
  apiProps: ApiProps;
  updateApiProps: (props: Partial<ApiProps>) => void;
  handleApiConnect: (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string) => void;
  handleSkipConnect: () => void;
  handleParseText: (text: string, providedProjectName: string | null) => void;
  handleContinueToProcess: (tasks: Task[]) => void;
  handleContinueToReview: (tasks: Task[]) => void;
  handleContinueToPreview: (tasks: Task[], updatedProjectName?: string) => void;
  handleComplete: () => void;
  handleStartOver: () => void;
  handleReconnect: () => void;
}
