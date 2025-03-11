
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, isLoading, authError, setAuthError } = useAuth();

  // Set up an auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (event === 'SIGNED_IN' && session) {
        navigate('/app');
      }
    });

    // Check if we should skip auth (from URL param)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip') === 'true') {
      sessionStorage.setItem('skip_auth', 'true');
      navigate('/app');
    }

    // Check if skip_auth is already set in sessionStorage
    if (sessionStorage.getItem('skip_auth') === 'true') {
      navigate('/app');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (email: string, password: string) => {
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbbc05] flex flex-col items-center justify-center p-4 font-georgia">
      <AuthForm
        onSubmit={handleAuth}
        isLoading={isLoading}
        authError={authError}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
      />
    </div>
  );
};

export default Login;
