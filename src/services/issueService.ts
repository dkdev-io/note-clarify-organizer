
import { supabase } from "@/integrations/supabase/client";
import { Issue, IssueFormData } from "@/types/issue";

export const issueService = {
  // Fetch all issues
  async getAllIssues(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from('issue_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }

    return data as Issue[];
  },

  // Get a single issue by ID
  async getIssueById(id: string): Promise<Issue | null> {
    const { data, error } = await supabase
      .from('issue_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching issue ${id}:`, error);
      return null;
    }

    return data as Issue;
  },

  // Create a new issue
  async createIssue(issueData: IssueFormData): Promise<Issue | null> {
    const { data, error } = await supabase
      .from('issue_logs')
      .insert([issueData])
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      throw error;
    }

    return data as Issue;
  },

  // Update an existing issue
  async updateIssue(id: string, issueData: Partial<IssueFormData>): Promise<Issue | null> {
    const { data, error } = await supabase
      .from('issue_logs')
      .update({
        ...issueData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating issue ${id}:`, error);
      throw error;
    }

    return data as Issue;
  },

  // Delete an issue
  async deleteIssue(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('issue_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting issue ${id}:`, error);
      return false;
    }

    return true;
  }
};
