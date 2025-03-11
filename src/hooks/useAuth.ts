
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log(`Attempting to sign up with email: ${email}`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email_confirmed: true // Add user metadata indicating email is confirmed
          }
        }
      });

      if (error) throw error;
      
      console.log('Sign up response:', data);
      
      // Immediately sign in after signup
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        toast({
          title: "Account created",
          description: "Your account has been created and you are now signed in",
        });
        
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      handleAuthError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
    
    return true;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log(`Attempting to log in with email: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login successful:', data);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      navigate('/app');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      handleAuthError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    let errorMessage = error.message || 'An unknown authentication error occurred';
    
    // Provide more user-friendly messages for common errors
    if (errorMessage.includes('Invalid login credentials')) {
      errorMessage = 'Email or password is incorrect. Please try again.';
    } else if (errorMessage.includes('already registered')) {
      errorMessage = 'This email is already registered. Please log in instead.';
    } else if (errorMessage.includes('Email not confirmed')) {
      errorMessage = 'Please try logging in again. If the issue persists, contact support.';
    }
    
    setAuthError(errorMessage);
    
    toast({
      title: "Authentication error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  return {
    signUp,
    signIn,
    isLoading,
    authError,
    setAuthError
  };
};
