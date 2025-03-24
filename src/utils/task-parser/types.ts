
export interface TaskSuggestions {
  dueDate?: string | null;
  priority?: string | null;
  description?: string | null;
  assignee?: string | null;
  timeEstimate?: string | null;
  labels?: string[] | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startDate: string | null;
  hardDeadline: boolean;
  priority: "low" | "medium" | "high" | null;
  status: string;
  assignee: string | null;
  workspace_id: string | null;
  isRecurring: boolean;
  frequency: string | null;
  project: string | null;
  projectId: string | null;
  duration: string | null;
  timeEstimate: number | null;
  folder: string | null;
  autoScheduled: boolean;
  isPending: boolean;
  schedule: string | null;
  labels: string[] | null;
  customFields: Record<string, any> | null;
  suggestions?: TaskSuggestions;
}

export interface RecurringTaskInfo {
  isRecurring: boolean;
  frequency: string | null;
}
