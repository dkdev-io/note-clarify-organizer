import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/AuthForm';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the user was redirected from another page
  const from = location.state?.from?.pathname || '/app';
  
  // Get the signup parameter from the URL
  const urlParams = new URLSearchParams(location.search);
  const signupParam = urlParams.get('signup');
  
  console.log('Login page loaded, signup param:', signupParam);

  // Set signup mode based on URL parameter
  useEffect(() => {
    console.log('URL signup parameter changed:', signupParam);
    if (signupParam === 'true') {
      setIsSignUp(true);
    }
  }, [signupParam]);

  // Check if user is already authenticated, redirect to app if they are
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(from, { replace: true });
      } else if (location.pathname === '/login' && !location.state?.from) {
        // If user directly accessed /login without state, redirect to landing
        navigate('/', { replace: true });
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
  }, [navigate, from, location]);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Show success message for sign up
        setAuthError('Check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      setAuthError(error.message || 'An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
      <Link to="/" className="mb-8 text-lg font-bold flex items-center">
        <span className="mr-2">🚀</span> Back to Home
      </Link>
      
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
