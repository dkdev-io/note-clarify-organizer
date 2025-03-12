
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

  // Clear skip_auth when on the login page
  useEffect(() => {
    // Remove the skip_auth flag when visiting login page
    // This ensures the proper auth flow is followed
    sessionStorage.removeItem('skip_auth');
    
    // Also clear any existing session to force a clean login
    const clearSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If there's an active session, sign out
        await supabase.auth.signOut();
        console.log('Existing session cleared for clean login');
      }
    };
    
    clearSession();
    console.log('Login page loaded, signup param:', signupParam);
  }, [signupParam]);

  // Set up an auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (event === 'SIGNED_IN' && session) {
        navigate('/app');
      }
    });

    // Don't check for skip parameter here, let the AuthForm and ProtectedRoute handle it

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Additional effect specifically for the signup parameter
  useEffect(() => {
    console.log('URL signup parameter changed:', signupParam);
    setIsSignUp(signupParam === 'true');
  }, [signupParam]);

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
