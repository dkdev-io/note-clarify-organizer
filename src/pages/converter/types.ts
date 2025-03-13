
export type Step = 'connect' | 'input' | 'extract' | 'process' | 'review' | 'preview' | 'complete';

export interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[];
  selectedWorkspaceId?: string;
  selectedProject?: string;
  users?: any[];
}
