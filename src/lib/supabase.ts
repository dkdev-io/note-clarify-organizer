
import { createClient } from '@supabase/supabase-js';

// For development/demo purposes only - replace with real values in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'placeholder-key-for-development-only';

// Log a reminder message instead of an error
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using placeholder Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for full functionality.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the urls for access check
export const credentials = {
  url: supabaseUrl,
  key: supabaseAnonKey
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
