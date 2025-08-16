
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { validateMotionApiKey, fetchWorkspaces, setMotionApiKey } from '@/utils/motion';
import { storeApiKey, retrieveApiKey, clearStoredApiKey } from '@/utils/keyStorage';
import { ApiKeyInput, ConnectionActions } from './motion-connect';

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
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkForStoredApiKey = async () => {
      const usingProxy = sessionStorage.getItem('using_motion_proxy') === 'true';
      setIsProxyMode(usingProxy);
      
      if (usingProxy) {
        setIsKeyValid(true);
        const defaultWorkspaces = [
          { id: 'proxy-workspace-1', name: 'Default Workspace' }
        ];
        
        toast({
          title: "Connected via Proxy",
          description: "You're connected to Motion via the application proxy. Now select your workspace and project.",
        });
        
        onConnect('proxy_mode', defaultWorkspaces);
        return;
      }

      // Try to get API key from Supabase secrets first
      try {
        const response = await fetch('/functions/v1/get-motion-api-key', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasApiKey && data.apiKey) {
            setApiKey(data.apiKey);
            setIsAlreadyConnected(true);
            setIsKeyValid(true);
            
            // Auto-validate and connect
            try {
              const fetchedWorkspaces = await fetchWorkspaces(data.apiKey);
              toast({
                title: "✓ Connected Successfully",
                description: "Advancing to next step...",
              });
              
              // Auto-advance after 2 seconds
              setTimeout(() => {
                onConnect(data.apiKey, fetchedWorkspaces);
              }, 2000);
            } catch (error) {
              setIsKeyValid(false);
              setIsAlreadyConnected(false);
              toast({
                title: "Connection Error",
                description: "Please re-enter your API key to continue.",
                variant: "destructive",
              });
            }
            return;
          }
        }
      } catch (error) {
        console.log('No stored API key found in secure storage, checking local storage...');
      }

      // Fallback to localStorage
      const storedKey = retrieveApiKey();
      if (storedKey) {
        setApiKey(storedKey);
        setIsAlreadyConnected(true);
        setIsKeyValid(true);
        
        // Auto-validate and connect
        try {
          const fetchedWorkspaces = await fetchWorkspaces(storedKey);
          toast({
            title: "✓ Connected Successfully",
            description: "Advancing to next step...",
          });
          
          // Auto-advance after 2 seconds
          setTimeout(() => {
            onConnect(storedKey, fetchedWorkspaces);
          }, 2000);
        } catch (error) {
          setIsKeyValid(false);
          setIsAlreadyConnected(false);
          toast({
            title: "Connection Error",
            description: "Please re-enter your API key to continue.",
            variant: "destructive",
          });
        }
      }
    };

    checkForStoredApiKey();
  }, [toast, onConnect]);

  if (isProxyMode) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isAlreadyConnected && isKeyValid ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Connected Successfully</h3>
                <p className="text-muted-foreground">Your Motion API connection is active. Advancing to next step...</p>
              </div>
            ) : (
              <ApiKeyInput 
                apiKey={apiKey}
                setApiKey={setApiKey}
                isKeyValid={isKeyValid}
                errorMessage={errorMessage}
                rememberKey={rememberKey}
                setRememberKey={setRememberKey}
                handleClearApiKey={handleClearApiKey}
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
          {!(isAlreadyConnected && isKeyValid) && (
            <ConnectionActions 
              apiKey={apiKey}
              isValidating={isValidating}
              isKeyValid={isKeyValid}
              onSkip={onSkip}
              onValidate={validateKey}
            />
          )}
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
              title: "✓ Connected Successfully",
              description: "Advancing to next step...",
            });
            
            // Auto-advance after 2 seconds
            setTimeout(() => {
              onConnect(trimmedKey, fetchedWorkspaces);
            }, 2000);
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
