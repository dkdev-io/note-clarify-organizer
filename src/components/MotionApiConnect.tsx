
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckIcon, LoaderIcon, InfoIcon, LinkIcon, RefreshCwIcon, ShieldIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateMotionApiKey, fetchWorkspaces, setMotionApiKey } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";
import { storeApiKey, retrieveApiKey, clearStoredApiKey } from '@/utils/keyStorage';
import { Switch } from "@/components/ui/switch";

interface MotionApiConnectProps {
  onConnect: (apiKey: string, workspaces: any[], selectedWorkspace?: string, selectedProject?: string) => void;
  onSkip: () => void;
}

const MotionApiConnect: React.FC<MotionApiConnectProps> = ({ onConnect, onSkip }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProxyMode, setIsProxyMode] = useState(false);
  const [rememberKey, setRememberKey] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const usingProxy = sessionStorage.getItem('using_motion_proxy') === 'true';
    setIsProxyMode(usingProxy);
    
    if (usingProxy) {
      setIsKeyValid(true);
      const defaultWorkspaces = [
        { id: 'proxy-workspace-1', name: 'Default Workspace' }
      ];
      
      toast({
        title: "Connected via Proxy",
        description: "You're connected to Motion via the application proxy. No API key required.",
      });
      
      // Directly connect with proxy settings
      onConnect('proxy_mode', defaultWorkspaces, 'proxy-workspace-1');
    } else {
      // Try to load stored API key
      const storedKey = retrieveApiKey();
      if (storedKey) {
        setApiKey(storedKey);
        toast({
          title: "API Key Loaded",
          description: "A previously stored API key has been loaded. Click Connect to validate.",
        });
      }
    }
  }, [toast, onConnect]);

  useEffect(() => {
    if (apiKey) {
      setIsKeyValid(null);
      setErrorMessage(null);
    }
  }, [apiKey]);

  const validateKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter your Motion API key");
      return;
    }
    
    const trimmedKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    setIsValidating(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting API key validation...');
      setMotionApiKey(trimmedKey);
      
      await validateMotionApiKey(trimmedKey);
      setIsKeyValid(true);
      
      console.log('API key is valid, fetching workspaces...');
      const fetchedWorkspaces = await fetchWorkspaces(trimmedKey);
      console.log('Fetched workspaces:', fetchedWorkspaces);
      
      if (rememberKey) {
        storeApiKey(trimmedKey);
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved for future use.",
        });
      }
      
      if (fetchedWorkspaces.length === 0) {
        setErrorMessage(
          "Your API key is valid, but no workspaces were found. " +
          "Make sure you have at least one workspace in your Motion account."
        );
      } else {
        toast({
          title: "Successfully connected",
          description: "Your Motion API key is valid. Continue to select workspace and project.",
        });
        
        // Pass the API key and workspaces to the parent component
        onConnect(trimmedKey, fetchedWorkspaces);
      }
    } catch (error) {
      console.error("Error during validation:", error);
      setIsKeyValid(false);
      
      if (error instanceof Error) {
        setErrorMessage(error.message || 
          "Invalid Motion API key. Please check the key and try again. " +
          "Make sure you are using an API key created in your Motion account settings with proper permissions."
        );
      } else {
        setErrorMessage(
          "Failed to validate API key. Please check your internet connection and try again."
        );
      }
      
      toast({
        title: "Connection Error",
        description: "Failed to validate API key. Please ensure it has correct permissions.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleMotionDocsClick = () => {
    window.open('https://docs.usemotion.com/docs/api/authentication', '_blank');
  };

  const handleMotionSettingsClick = () => {
    window.open('https://app.usemotion.com/settings/developers/api-keys', '_blank');
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setIsKeyValid(null);
    setErrorMessage(null);
    clearStoredApiKey();
    
    toast({
      title: "API Key Cleared",
      description: "Your saved API key has been removed.",
    });
  };

  // If we're in proxy mode, this component won't be shown as we'll skip directly to workspace selection
  if (isProxyMode) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900">
            Connect to Motion
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Connecting to Motion API allows you to create tasks in your Motion account
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Motion API Key</Label>
              <div className="flex gap-2">
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
                  className={`flex-1 ${isKeyValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : 
                    isKeyValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                <div className="flex gap-1">
                  {apiKey && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleClearApiKey}
                      title="Clear API Key"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="remember-key" 
                  checked={rememberKey} 
                  onCheckedChange={setRememberKey} 
                />
                <Label htmlFor="remember-key" className="text-sm cursor-pointer">
                  Remember API key for future sessions
                </Label>
              </div>
              
              {errorMessage && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <Alert variant="default" className="mt-2 bg-blue-50 text-blue-800 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-xs">
                  Motion API keys can be found in your Motion account under Settings → API Keys. 
                  Make sure to create a new API key with read/write access.
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
                      onClick={handleMotionSettingsClick}
                    >
                      <ShieldIcon className="mr-1 h-3 w-3" />
                      Generate API Key
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-blue-600 underline-offset-2 font-normal flex items-center"
                      onClick={handleMotionDocsClick}
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      View Motion API docs
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Connecting to Motion API allows us to:</p>
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
            disabled={!apiKey.trim() || isValidating || isKeyValid === true}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isValidating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Motion API...
              </>
            ) : isKeyValid === true ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                Connected
              </>
            ) : (
              "Connect to Motion API"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MotionApiConnect;
