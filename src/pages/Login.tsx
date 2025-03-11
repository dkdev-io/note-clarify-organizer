import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase, credentials } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, WifiOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setIsNetworkError(false);

    // Check if credentials are valid
    if (!credentials.isValid) {
      setIsNetworkError(true);
      setAuthError("Please make sure your Supabase project is properly connected through the Lovable interface.");
      setIsLoading(false);
      toast({
        title: "Configuration Error",
        description: "Supabase integration needs to be configured",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Account created",
          description: "Please check your email for verification link",
        });
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      if (error.message === 'Failed to fetch' || error.toString().includes('Failed to fetch')) {
        setIsNetworkError(true);
        setAuthError("Could not connect to Supabase. Please check your configuration and try again.");
      } else {
        setAuthError(error.message || 'An unknown authentication error occurred');
      }
      
      toast({
        title: "Authentication error",
        description: isNetworkError 
          ? "Could not connect to Supabase" 
          : error.message || 'An unknown authentication error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbbc05] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-4xl font-bebas-neue">{isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}</CardTitle>
          <CardDescription className="font-georgia">
            {isSignUp 
              ? 'Enter your details to create a new account' 
              : 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive" className="border-4 border-black bg-red-100">
                {isNetworkError ? (
                  <WifiOff className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{isNetworkError ? "Configuration Error" : "Error"}</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            {isNetworkError && (
              <div className="text-sm text-gray-600 mt-2">
                <p>To resolve this:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Connect your Supabase project in Lovable</li>
                  <li>Make sure your Supabase project is active</li>
                  <li>Verify your internet connection</li>
                </ul>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-georgia">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black focus-visible:ring-[#fbbc05]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-georgia">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black focus-visible:ring-[#fbbc05]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-black/90 text-white font-bold text-lg py-6 rounded-none transition-transform hover:-translate-y-1"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            <Button 
              type="button" 
              variant="link" 
              className="font-georgia text-black"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
