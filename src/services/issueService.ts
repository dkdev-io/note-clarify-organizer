
import { supabase } from "@/integrations/supabase/client";
import { Issue, IssueFormData } from "@/types/issue";

export const issueService = {
  // Fetch all issues
  async getAllIssues(): Promise<Issue[]> {
    console.log('Fetching all issues from the database');
    const { data, error } = await supabase
      .from('issue_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} issues from the database`);
    return data as Issue[];
  },

  // Get a single issue by ID
  async getIssueById(id: string): Promise<Issue | null> {
    console.log(`Fetching issue with ID: ${id}`);
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
    // Add detailed console logs for debugging
    console.log('📋 Creating issue with data:', JSON.stringify(issueData, null, 2));
    
    // Validate the data before sending to Supabase
    if (!issueData.title) {
      console.error('❌ Issue data missing title - cannot create');
      throw new Error('Issue title is required');
    }
    
    // Validate priority field
    if (issueData.priority && !['low', 'medium', 'high', 'critical'].includes(issueData.priority)) {
      console.error(`❌ Invalid priority value: ${issueData.priority}`);
      issueData.priority = 'medium'; // Default to medium if invalid
    }
    
    // Add timestamps if not present
    const dataWithTimestamps = {
      ...issueData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Sending data to Supabase:', JSON.stringify(dataWithTimestamps, null, 2));
    
    // Table name check
    const tableName = 'issue_logs';
    console.log(`Using table name: ${tableName}`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([dataWithTimestamps])
        .select();
        
      if (error) {
        console.error('❌ Error creating issue:', error);
        console.error('❌ Error details:', error.message, error.details, error.hint);
        throw error;
      }
      
      console.log('✅ Issue created successfully:', data);
      
      // Fix TypeScript error by properly checking if data exists and has elements
      return data && Array.isArray(data) && data.length > 0 ? data[0] as Issue : null;
    } catch (queryError) {
      console.error('❌ Exception while creating issue:', queryError);
      throw queryError;
    }
  },

  // Update an existing issue
  async updateIssue(id: string, issueData: Partial<IssueFormData>): Promise<Issue | null> {
    console.log('Updating issue with ID:', id, 'and data:', issueData);
    
    const { data, error } = await supabase
      .from('issue_logs')
      .update({
        ...issueData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error updating issue ${id}:`, error);
      console.error('Error details:', error.message, error.details, error.hint);
      throw error;
    }
    
    console.log('Issue updated successfully:', data);
    
    // Fix TypeScript error by properly checking if data exists and has elements
    return data && Array.isArray(data) && data.length > 0 ? data[0] as Issue : null;
  },

  // Delete an issue
  async deleteIssue(id: string): Promise<boolean> {
    console.log('Deleting issue with ID:', id);
    
    const { error } = await supabase
      .from('issue_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting issue ${id}:`, error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    console.log('Issue deleted successfully');
    
    return true;
  },
  
  // Create issue with specific ID
  async createIssueWithId(id: string, issueData: IssueFormData): Promise<Issue | null> {
    console.log('📋 Creating issue with specific ID:', id);
    console.log('📋 Issue data:', JSON.stringify(issueData, null, 2));
    
    // Validate the data
    if (!issueData.title) {
      console.error('❌ Issue data missing title - cannot create');
      throw new Error('Issue title is required');
    }
    
    // Add timestamps and ID
    const dataWithDetails = {
      ...issueData,
      id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('issue_logs')
        .insert([dataWithDetails])
        .select();
        
      if (error) {
        console.error('❌ Error creating issue with ID:', error);
        console.error('❌ Error details:', error.message, error.details, error.hint);
        throw error;
      }
      
      console.log('✅ Issue created successfully with ID:', id);
      
      return data && Array.isArray(data) && data.length > 0 ? data[0] as Issue : null;
    } catch (queryError) {
      console.error('❌ Exception while creating issue with ID:', queryError);
      throw queryError;
    }
  }
};
