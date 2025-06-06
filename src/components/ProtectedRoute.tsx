
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase, credentials } from '@/lib/supabase';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Temporarily disable authentication - always allow access
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(true); // Always true for now
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Skip all authentication checks temporarily
  useEffect(() => {
    console.log('ProtectedRoute - Auth temporarily disabled, allowing access');
    setAuthenticated(true);
    setLoading(false);
  }, [location]);

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
        <Button onClick={() => navigate('/')} className="mb-2">
          Go to Landing
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  // Always render children since auth is temporarily disabled
  return <>{children}</>;
};

export default ProtectedRoute;
