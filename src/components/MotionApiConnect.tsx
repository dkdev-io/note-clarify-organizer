import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { validateMotionApiKey, fetchWorkspaces, setMotionApiKey } from '@/utils/motion';
import { storeApiKey, retrieveApiKey, clearStoredApiKey } from '@/utils/keyStorage';
import { ApiKeyInput, ConnectionFeatures, ConnectionActions } from './motion-connect';

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
      
      onConnect('proxy_mode', defaultWorkspaces, 'proxy-workspace-1');
    } else {
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
            <ApiKeyInput 
              apiKey={apiKey}
              setApiKey={setApiKey}
              isKeyValid={isKeyValid}
              errorMessage={errorMessage}
              rememberKey={rememberKey}
              setRememberKey={setRememberKey}
              handleClearApiKey={handleClearApiKey}
            />
            
            <ConnectionFeatures />
          </div>
        </CardContent>
        <CardFooter>
          <ConnectionActions 
            apiKey={apiKey}
            isValidating={isValidating}
            isKeyValid={isKeyValid}
            onSkip={onSkip}
            onValidate={validateKey}
          />
        </CardFooter>
      </Card>
    </div>
  );

  function validateKey() {
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
      
      validateMotionApiKey(trimmedKey)
        .then(() => {
          setIsKeyValid(true);
          
          console.log('API key is valid, fetching workspaces...');
          return fetchWorkspaces(trimmedKey);
        })
        .then((fetchedWorkspaces) => {
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
            
            onConnect(trimmedKey, fetchedWorkspaces);
          }
        })
        .catch((error) => {
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
        })
        .finally(() => {
          setIsValidating(false);
        });
    } catch (error) {
      console.error("Error during validation:", error);
      setIsKeyValid(false);
      setIsValidating(false);
      
      setErrorMessage(
        "An unexpected error occurred. Please try again later."
      );
      
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleClearApiKey() {
    setApiKey('');
    setIsKeyValid(null);
    setErrorMessage(null);
    clearStoredApiKey();
    
    toast({
      title: "API Key Cleared",
      description: "Your saved API key has been removed.",
    });
  }
};

export default MotionApiConnect;
