
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

const CORRECT_PASSWORD = 'project2025ize!';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if already authenticated via session storage
  useEffect(() => {
    const passwordAuth = sessionStorage.getItem('password_auth');
    if (passwordAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network request with a small delay
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        sessionStorage.setItem('password_auth', 'true');
        setIsAuthenticated(true);
        toast({
          title: "Access granted",
          description: "Welcome to Projectize!",
        });
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          title: "Access denied",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-lg rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            <span className="text-black">Project</span><span className="text-[#fbbc05]">ize</span>
          </CardTitle>
          <CardDescription>
            This site is password protected. Please enter the password to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#fbbc05] hover:bg-[#fbbc05]/90 text-black font-medium py-5 rounded-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Access Site'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordProtection;
