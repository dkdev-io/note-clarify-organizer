
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  assigned_to: string | null;
}

export interface IssueFormData {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  created_by?: string;
  assigned_to?: string;
}
