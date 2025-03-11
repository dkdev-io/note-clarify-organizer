import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = 'https://fvxfmlhvxmpmbtouarcp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the credentials and status for access check
export const credentials = {
  url: supabaseUrl,
  key: supabaseAnonKey,
  isValid: true
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
