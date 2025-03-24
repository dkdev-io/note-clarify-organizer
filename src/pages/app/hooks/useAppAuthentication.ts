
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function useAppAuthentication() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticating(false);
      
      // If no session and not on login page, redirect to login
      if (!data.session && location.pathname !== '/login') {
        navigate('/login', { state: { from: location } });
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in AppContent:', event);
      if (!session && location.pathname !== '/login') {
        navigate('/login', { state: { from: location } });
      }
    });
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location]);

  return { isAuthenticating };
}
