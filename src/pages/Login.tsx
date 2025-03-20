
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/AuthForm';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Check if the user was redirected from another page
  const from = location.state?.from?.pathname || '/app/converter';
  
  // Get the signup parameter from the URL
  const signupParam = searchParams.get('signup');
  // Handle access_token if present in URL (for email confirmations)
  const accessToken = searchParams.get('access_token');
  
  console.log('Login page loaded, signup param:', signupParam);
  console.log('Access token in URL:', accessToken ? 'Present' : 'Not present');

  // Set signup mode based on URL parameter
  useEffect(() => {
    console.log('URL signup parameter changed:', signupParam);
    if (signupParam === 'true') {
      setIsSignUp(true);
    }
  }, [signupParam]);

  // Handle access token if present in URL (email confirmation flow)
  useEffect(() => {
    const handleAccessToken = async () => {
      if (accessToken) {
        setIsLoading(true);
        console.log('Processing access token from URL');
        
        try {
          // Exchange the access token for a session
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'email'
          });
          
          if (error) {
            console.error('Error verifying email token:', error);
            toast({
              title: "Verification error",
              description: error.message || "Failed to verify your email. Please try logging in again.",
              variant: "destructive",
            });
            setAuthError(error.message || "Verification failed. Please try logging in directly.");
          } else if (data.session) {
            console.log('Email verification successful, redirecting to app');
            toast({
              title: "Email verified",
              description: "Your email has been verified and you are now signed in.",
            });
            navigate(from, { replace: true });
          }
        } catch (error: any) {
          console.error('Exception during token verification:', error);
          setAuthError(error.message || "An unexpected error occurred during verification");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleAccessToken();
  }, [accessToken, navigate, from, toast]);

  // Check if user is already authenticated, redirect to app if they are
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(from, { replace: true });
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Has session' : 'No session');
      if (session) {
        navigate(from, { replace: true });
      }
    });
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, from]);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/login'
          }
        });
        
        if (error) throw error;
        
        // Show success message for sign up
        toast({
          title: "Account created",
          description: "Check your email for the confirmation link.",
        });
        setAuthError('Check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
    } catch (error: any) {
      setAuthError(error.message || 'An unexpected error occurred');
      
      toast({
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        authError={authError}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
      />
    </div>
  );
};

export default Login;
