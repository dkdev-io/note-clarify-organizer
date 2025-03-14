
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, SkipForward } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  isLoading,
  authError,
  isSignUp,
  setIsSignUp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  const handleSkip = () => {
    // Set skip flag in sessionStorage
    sessionStorage.setItem('skip_auth', 'true');
    // Use navigate directly instead of changing window.location
    navigate('/app');
  };

  return (
    <Card className="w-full max-w-md border border-gray-200 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-8">
        <CardTitle className="text-3xl font-bold">{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Enter your details to create a new account' 
            : 'Enter your credentials to access your account'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {authError && (
            <Alert variant="destructive" className="border border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 focus-visible:ring-[#fbbc05]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 focus-visible:ring-[#fbbc05]"
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-medium text-base py-6 rounded-lg transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          <Button 
            type="button" 
            variant="link" 
            className="text-gray-600"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium mt-2 flex items-center justify-center gap-2 rounded-lg"
            onClick={handleSkip}
          >
            <SkipForward className="h-4 w-4" />
            Skip until auth issues fixed
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
