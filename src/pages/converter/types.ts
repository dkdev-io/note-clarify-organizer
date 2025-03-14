
export type Step = 'connect' | 'workspace' | 'input' | 'extract' | 'process' | 'review' | 'preview' | 'complete';

export interface ApiProps {
  isConnected: boolean;
  apiKey: string | null;
  workspaces: any[] | null;
  users: any[] | null;
  selectedWorkspaceId: string | null;
  selectedProject: string | null;
  selectedProjectId: string | null;
}
