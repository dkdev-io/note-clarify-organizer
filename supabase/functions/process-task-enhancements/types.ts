
// Task type definition for the edge function
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  hardDeadline?: boolean;
  priority?: string | null;
  status?: string;
  assignee?: string | null;
  workspace_id?: string | null;
  isRecurring?: boolean;
  frequency?: string | null;
  project?: string | null;
  projectId?: string | null;
  duration?: string | null;
  timeEstimate?: number | null;
  folder?: string | null;
  autoScheduled?: boolean;
  isPending?: boolean;
  schedule?: string;
  labels?: string[] | null;
  customFields?: Record<string, any> | null;
  suggestions?: {
    suggestedDueDate?: string | null;
    suggestedPriority?: string | null;
    suggestedDescription?: string | null;
    reasoning?: string | null;
  };
}
