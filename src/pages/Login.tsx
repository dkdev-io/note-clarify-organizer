
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Set up an auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      if (event === 'SIGNED_IN' && session) {
        navigate('/app');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // Sign up without email verification
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
      } else {
        // Login
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
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
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
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
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
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
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
