
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckIcon, LoaderIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateMotionApiKey, fetchWorkspaces } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";

interface MotionApiConnectProps {
  onConnect: (apiKey: string, workspaces: any[]) => void;
  onSkip: () => void;
}

const MotionApiConnect: React.FC<MotionApiConnectProps> = ({ onConnect, onSkip }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const validateKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter your Motion API key");
      return;
    }
    
    setIsValidating(true);
    setErrorMessage(null);
    
    try {
      const isValid = await validateMotionApiKey(apiKey);
      setIsKeyValid(isValid);
      
      if (isValid) {
        // If valid, fetch workspaces
        const workspaces = await fetchWorkspaces();
        toast({
          title: "Successfully connected",
          description: "Your Motion API key is valid and workspaces have been loaded.",
        });
        onConnect(apiKey, workspaces);
      } else {
        setErrorMessage("Invalid Motion API key. Please check and try again.");
        toast({
          title: "Connection Error",
          description: "Invalid Motion API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      setErrorMessage("Failed to validate API key. Please try again.");
      toast({
        title: "Connection Error",
        description: "Failed to validate API key",
        variant: "destructive",
      });
      setIsKeyValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900">
            Connect to Motion
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Connect to your Motion account to validate names, projects, and workspaces
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Motion API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Motion API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsKeyValid(null);
                  setErrorMessage(null);
                }}
                className={`${isKeyValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : 
                  isKeyValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errorMessage && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Connecting early allows us to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Validate assignee names against existing Motion users</li>
                <li>Check if projects already exist or need to be created</li>
                <li>Load your actual workspaces</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 pb-4 px-6">
          <Button 
            variant="outline" 
            onClick={onSkip}
          >
            Skip for now
          </Button>
          <Button 
            onClick={validateKey}
            disabled={!apiKey.trim() || isValidating}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isValidating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : isKeyValid === true ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                Connected
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MotionApiConnect;
