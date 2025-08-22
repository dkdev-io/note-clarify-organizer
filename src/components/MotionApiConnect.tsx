
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { validateMotionApiKey, fetchWorkspaces, setMotionApiKey, fetchUsers } from '@/utils/motion';
import { storeApiKey, retrieveApiKey, clearStoredApiKey } from '@/utils/keyStorage';
import { ApiKeyInput, ConnectionActions } from './motion-connect';
import WorkspaceSelect from './WorkspaceSelect';
import { ProjectSelect } from './project';

interface MotionApiConnectProps {
  onConnect: (apiKey: string, workspaces: any[], selectedWorkspace?: string, selectedProject?: string, users?: any[], projectId?: string) => void;
  onSkip: () => void;
}

const MotionApiConnect: React.FC<MotionApiConnectProps> = ({ onConnect, onSkip }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProxyMode, setIsProxyMode] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRetryTime, setRateLimitRetryTime] = useState<Date | null>(null);
  const validateStoredKeyRef = useRef<((key: string) => Promise<void>) | null>(null);
  const [rememberKey, setRememberKey] = useState(() => {
    // Check if user previously chose to remember their key
    try {
      const remembered = localStorage.getItem('motion_remember_key');
      return remembered === 'true';
    } catch {
      return false;
    }
  });
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  const [fetchedWorkspaces, setFetchedWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showWorkspaceSelection, setShowWorkspaceSelection] = useState(false);
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

      // Only check localStorage for stored API key
      const storedKey = retrieveApiKey();
      if (storedKey) {
        setApiKey(storedKey);
        setIsAlreadyConnected(true);
        
        // Validate the stored key immediately
        await validateStoredKey(storedKey);
      }
    };

    const validateStoredKey = async (key: string) => {
      try {
        setIsValidating(true);
        await validateMotionApiKey(key);
        const workspaces = await fetchWorkspaces(key);
        
        setIsKeyValid(true);
        setFetchedWorkspaces(workspaces);
        setShowWorkspaceSelection(true);
        setIsRateLimited(false);
        setRateLimitRetryTime(null);
        
        toast({
          title: "✓ Connected Successfully",
          description: "Using your saved API key. Please select your workspace and project.",
        });
      } catch (error: any) {
        console.error('Stored API key validation failed:', error);
        
        // Check if this is a rate limit error
        if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
          setIsRateLimited(true);
          const retryTime = new Date(Date.now() + 60000); // Wait 1 minute
          setRateLimitRetryTime(retryTime);
          
          setErrorMessage("Motion API rate limit reached. Please wait a minute and try again.");
          toast({
            title: "Rate Limited",
            description: "Too many requests to Motion API. Please wait a minute before trying again.",
            variant: "destructive"
          });
          // DON'T clear the API key on rate limit errors
        } else {
          // Only clear API key for actual authentication failures
          setIsKeyValid(false);
          setIsAlreadyConnected(false);
          clearStoredApiKey();
          setErrorMessage("Your saved API key is no longer valid. Please enter a new one.");
        }
      } finally {
        setIsValidating(false);
      }
    };
    
    // Store the function in the ref so it can be called from outside the useEffect
    validateStoredKeyRef.current = validateStoredKey;

    checkForStoredApiKey();
  }, [toast, onConnect]);

  const handleWorkspaceSelect = async (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    
    // Fetch users for the selected workspace
    if (apiKey) {
      try {
        const users = await fetchUsers(workspaceId, apiKey);
        // Store users for later use if needed
      } catch (error) {
        console.error('Failed to fetch users for workspace:', error);
      }
    }
  };

  const handleProjectSelect = (projectName: string, projectId?: string) => {
    setSelectedProject(projectName);
    setSelectedProjectId(projectId || null);
  };

  const handleClearConnection = () => {
    setIsAlreadyConnected(false);
    setIsKeyValid(null);
    setShowWorkspaceSelection(false);
    setSelectedWorkspaceId(null);
    setSelectedProject(null);
    setApiKey('');
    clearStoredApiKey();
  };

  const handleSubmitSelection = async () => {
    if (!selectedWorkspaceId || !selectedProject || !apiKey) return;
    
    try {
      // Fetch users for the selected workspace
      const users = await fetchUsers(selectedWorkspaceId, apiKey);
      
      // Call the onConnect callback with all the data
      onConnect(apiKey, fetchedWorkspaces, selectedWorkspaceId, selectedProject, users, selectedProjectId || undefined);
      
      toast({
        title: "Setup Complete",
        description: "Successfully connected to Motion with your selected workspace and project.",
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      // Still proceed even if users fetch fails
      onConnect(apiKey, fetchedWorkspaces, selectedWorkspaceId, selectedProject, [], selectedProjectId || undefined);
      
      toast({
        title: "Setup Complete", 
        description: "Successfully connected to Motion. User list may be limited.",
      });
    }
  };

  if (isProxyMode) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-card border shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Step One</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">Connect to Motion</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isRateLimited ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-yellow-600 text-4xl mb-2">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Rate Limited</h3>
                  <p className="text-muted-foreground text-sm">Motion API has rate limited our requests.</p>
                  {rateLimitRetryTime && (
                    <p className="text-muted-foreground text-sm mt-2">
                      Please wait until: {rateLimitRetryTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setIsRateLimited(false);
                      setRateLimitRetryTime(null);
                      if (apiKey && validateStoredKeyRef.current) {
                        validateStoredKeyRef.current(apiKey);
                      }
                    }}
                    disabled={rateLimitRetryTime && new Date() < rateLimitRetryTime}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retry Connection
                  </button>
                  <button
                    onClick={handleClearConnection}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md"
                  >
                    Use Different Key
                  </button>
                </div>
              </div>
            ) : isAlreadyConnected && isKeyValid && !showWorkspaceSelection ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Connected Successfully</h3>
                <p className="text-muted-foreground">Your Motion API connection is active. Loading workspaces...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {showWorkspaceSelection && (
                  <div className="text-center py-4">
                    <div className="text-green-600 text-4xl mb-2">✓</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Connected to Motion</h3>
                    <p className="text-muted-foreground text-sm">Now select your workspace and project</p>
                  </div>
                )}
                
                <ApiKeyInput 
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  isKeyValid={isKeyValid}
                  errorMessage={errorMessage}
                  rememberKey={rememberKey}
                  setRememberKey={setRememberKey}
                  handleClearApiKey={handleClearApiKey}
                />
                
                {!showWorkspaceSelection && !(isAlreadyConnected && isKeyValid) && (
                  <ConnectionActions 
                    apiKey={apiKey}
                    isValidating={isValidating}
                    isKeyValid={isKeyValid}
                    onValidate={validateKey}
                  />
                )}
                
                <WorkspaceSelect 
                  apiKey={apiKey} 
                  selectedWorkspaceId={selectedWorkspaceId}
                  onWorkspaceSelect={handleWorkspaceSelect}
                  workspaces={fetchedWorkspaces.map(ws => ({ label: ws.name, value: ws.id }))}
                />
                
                <div className="text-left">
                  <ProjectSelect
                    apiKey={apiKey}
                    workspaceId={selectedWorkspaceId}
                    selectedProject={selectedProject}
                    onProjectSelect={handleProjectSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {showWorkspaceSelection && selectedWorkspaceId && selectedProject && (
            <div className="flex justify-between items-center pt-2 pb-4 px-6 w-full">
              <button 
                onClick={handleClearConnection}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use different API key
              </button>
              <button 
                onClick={handleSubmitSelection}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                Submit & Continue
              </button>
            </div>
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
        .then((workspaces) => {
          console.log('Fetched workspaces:', workspaces);
          
          // Store workspaces and show selection
          setFetchedWorkspaces(workspaces);
          setShowWorkspaceSelection(true);
          
          // Always save the preference, only store key if rememberKey is true
          localStorage.setItem('motion_remember_key', rememberKey.toString());
          
          
          if (rememberKey) {
            storeApiKey(trimmedKey);
            toast({
              title: "API Key Saved",
              description: "Your API key has been saved for future use.",
            });
          }
          
          if (workspaces.length === 0) {
            setErrorMessage(
              "Your API key is valid, but no workspaces were found. " +
              "Make sure you have at least one workspace in your Motion account."
            );
          } else {
            toast({
              title: "✓ Connected Successfully",
              description: "Please select your workspace and project below.",
            });
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
    setRememberKey(false);
    clearStoredApiKey();
    localStorage.setItem('motion_remember_key', 'false');
    
    toast({
      title: "API Key Cleared",
      description: "Your saved API key has been removed.",
    });
  }
};

export default MotionApiConnect;
