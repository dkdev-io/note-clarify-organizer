
export type Step = 'connect' | 'input' | 'extract' | 'enhance' | 'process' | 'review' | 'preview' | 'complete';

export interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  users?: any[];
  selectedWorkspaceId: string | null;
  selectedProject: string | null;
  selectedProjectId?: string | null;
}

// Add Task type export to ensure consistency
export { type Task } from '@/utils/task-parser/types';
