
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://fvxfmlhvxmpmbtouarcp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if we have a valid configuration
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder-project') && 
  !supabaseAnonKey?.includes('placeholder-key');

// Log status message
if (!hasValidCredentials) {
  console.warn('Using fallback or incomplete Supabase credentials. For full functionality, ensure Supabase integration is properly connected.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// Export the credentials and status for access check
export const credentials = {
  url: supabaseUrl,
  key: supabaseAnonKey,
  isValid: hasValidCredentials
};

// Admin function to check if a user is an admin
export const isAdminUser = async (email: string) => {
  try {
    // This is a placeholder function
    // In a real app, you would query your database to check if the user is an admin
    return email === 'dan@dkdev.io';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
