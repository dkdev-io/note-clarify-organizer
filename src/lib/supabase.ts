
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
