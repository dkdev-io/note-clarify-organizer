
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase, credentials } from '@/lib/supabase';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if the user is trying to skip authentication
  const isSkipping = sessionStorage.getItem('skip_auth') === 'true';

  useEffect(() => {
    // If skipping, set authenticated to true immediately
    if (isSkipping) {
      console.log('Skipping authentication check due to skip_auth flag');
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // First check if Supabase is properly configured
    if (!credentials.isValid) {
      setError('Supabase configuration missing. Please ensure your Supabase project is connected through Lovable.');
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setAuthenticated(!!data.session);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthenticated(false);
        setError('Authentication check failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isSkipping]);

  // Show loading spinner or placeholder while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-sm text-gray-600 mb-6 max-w-md">
          <p>To resolve this:</p>
          <ul className="list-disc list-inside ml-2 mt-1">
            <li>Connect your Supabase project in Lovable</li>
            <li>Make sure your Supabase project is active</li>
            <li>Verify your internet connection</li>
          </ul>
        </div>
        <Button onClick={() => navigate('/login')} className="mb-2">
          Go to Login
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
