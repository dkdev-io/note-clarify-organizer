
import { Task } from '@/utils/parser';
import { Step, ApiProps } from '../types';

// Define interface for the App context
export interface AppContextType {
  step: Step;
  setStep: (step: Step) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  extractedTasks: Task[];
  setExtractedTasks: (tasks: Task[]) => void;
  projectName: string | null;
  setProjectName: (name: string | null) => void;
  apiProps: ApiProps;
  updateApiProps: (props: Partial<ApiProps>) => void;
  handleApiConnect: (apiKey: string, fetchedWorkspaces: any[], workspaceId?: string, project?: string) => void;
  handleSkipConnect: () => void;
  handleParseText: (
    text: string, 
    providedProjectName: string | null, 
    setUnrecognizedNames?: ((names: string[]) => void) | Record<string, string | null>
  ) => void;
  handleAddToMotion: (tasks: Task[], projectName: string | null, unassignedCount?: number, apiProps?: ApiProps) => void;
  handleStartOver: () => void;
  handleReconnect: () => void;
  isProcessing: boolean;
}
