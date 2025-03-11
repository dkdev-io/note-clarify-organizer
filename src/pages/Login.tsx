
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Check for signup parameter in the URL
  const urlParams = new URLSearchParams(location.search);
  const signupParam = urlParams.get('signup');
  
  // Default to signup view when coming from landing page with signup=true
  const [isSignUp, setIsSignUp] = useState(signupParam === 'true');
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
    const skipParam = urlParams.get('skip');
    if (skipParam === 'true') {
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

  // Additional effect specifically for the signup parameter
  useEffect(() => {
    console.log('URL signup parameter changed:', signupParam);
    setIsSignUp(signupParam === 'true');
  }, [signupParam, location.search]);

  const handleAuth = async (email: string, password: string) => {
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbbc05] flex flex-col items-center justify-center p-4 font-georgia">
      <Link to="/" className="absolute top-4 left-4 flex items-center text-black hover:text-gray-800">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>
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
