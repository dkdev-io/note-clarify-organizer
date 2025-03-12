import { ApiProps } from '../../types';
import { storeApiKey } from '@/utils/keyStorage';
import { Step } from '../../types';

// Handle API connection
export const handleApiConnect = (
  apiKey: string, 
  fetchedWorkspaces: any[], 
  workspaceId?: string, 
  project?: string,
  setApiProps: (props: ApiProps) => void,
  setProjectName: (name: string | null) => void,
  setStep: (step: Step) => void
) => {
  // Store the API key in the app context
  if (apiKey !== 'proxy_mode') {
    // We'll store in localStorage in the MotionApiConnect component
    // But we still update our application state
    storeApiKey(apiKey);
  }
  
  // Just update API key and workspaces but move to workspace selection step instead
  setApiProps({
    apiKey,
    workspaces: fetchedWorkspaces,
    selectedWorkspaceId: workspaceId,
    selectedProject: project,
    isConnected: true,
  });
  
  // If connected via proxy mode with default workspace, skip to input
  if (apiKey === 'proxy_mode' && workspaceId) {
    setProjectName(project || null);
    setStep('input');
  } else {
    // Otherwise go to workspace selection step
    setStep('workspace');
  }
};

// Handle skipping API connection
export const handleSkipConnect = (
  setStep: (step: Step) => void,
  updateApiProps: (props: Partial<ApiProps>) => void
) => {
  updateApiProps({ isConnected: false });
  setStep('input');
};

// Handle starting over
export const handleStartOver = (
  setNoteText: (text: string) => void,
  setExtractedTasks: (tasks: any[]) => void,
  setProjectName: (name: string | null) => void,
  apiProps: ApiProps,
  setStep: (step: Step) => void
) => {
  setNoteText('');
  setExtractedTasks([]);
  // Keep project and workspace if connected to API
  if (!apiProps.isConnected) {
    setProjectName(null);
  }
  // Keep API connection but return to input step
  setStep('input');
};

// Reconnect to Motion API
export const handleReconnect = (
  setStep: (step: Step) => void
) => {
  setStep('connect');
};
