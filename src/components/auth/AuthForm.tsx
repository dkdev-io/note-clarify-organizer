
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
    // Force navigation to the app without auth check
    window.location.href = '/app';
  };

  return (
    <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-4xl font-bebas-neue">{isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}</CardTitle>
        <CardDescription className="font-georgia">
          {isSignUp 
            ? 'Enter your details to create a new account' 
            : 'Enter your credentials to access your account'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-2 border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium mt-2 flex items-center justify-center gap-2"
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
