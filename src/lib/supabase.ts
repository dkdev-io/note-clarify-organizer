
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = 'https://fvxfmlhvxmpmbtouarcp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if we have a valid configuration
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseAnonKey?.length > 0;

// Log status message
if (!hasValidCredentials) {
  console.warn('Supabase anon key missing. Please ensure Supabase integration is properly connected through Lovable.');
}

// Create the Supabase client with a fallback empty string for the key if it's missing
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
