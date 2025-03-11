
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvxfmlhvxmpmbtouarcp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGZtbGh2eG1wbWJ0b3VhcmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjE0MzQsImV4cCI6MjA1NzI5NzQzNH0.r0h6kc5obgxrzBldoCFodRoo9pbY8tghWgnjtQ2BR9Q';

// Create the Supabase client with redirect settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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
