import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckIcon, LoaderIcon, InfoIcon, LinkIcon, RefreshCwIcon, ShieldIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateMotionApiKey, fetchWorkspaces, setMotionApiKey } from '@/utils/motion';
import { useToast } from "@/components/ui/use-toast";
import WorkspaceSelect from './WorkspaceSelect';
import ProjectSelect from './ProjectSelect';

interface MotionApiConnectProps {
  onConnect: (apiKey: string, workspaces: any[], selectedWorkspace?: string, selectedProject?: string) => void;
  onSkip: () => void;
}

const MotionApiConnect: React.FC<MotionApiConnectProps> = ({ onConnect, onSkip }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isProxyMode, setIsProxyMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const usingProxy = sessionStorage.getItem('using_motion_proxy') === 'true';
    setIsProxyMode(usingProxy);
    
    if (usingProxy) {
      setIsKeyValid(true);
      const defaultWorkspaces = [
        { id: 'proxy-workspace-1', name: 'Default Workspace' }
      ];
      setWorkspaces(defaultWorkspaces);
      setSelectedWorkspaceId('proxy-workspace-1');
      
      toast({
        title: "Connected via Proxy",
        description: "You're connected to Motion via the application proxy. No API key required.",
      });
    }
  }, [toast]);

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
      setWorkspaces(fetchedWorkspaces);
      
      if (fetchedWorkspaces.length === 0) {
        setErrorMessage(
          "Your API key is valid, but no workspaces were found. " +
          "Make sure you have at least one workspace in your Motion account."
        );
      } else {
        toast({
          title: "Successfully connected",
          description: "Your Motion API key is valid and workspaces have been loaded.",
        });
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

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedProject(null);
    setSelectedProjectId(null);
  };

  const handleProjectSelect = (projectName: string, projectId?: string) => {
    setSelectedProject(projectName);
    setSelectedProjectId(projectId || null);
  };

  const handleConnect = () => {
    if (isProxyMode) {
      onConnect('proxy_mode', workspaces, selectedWorkspaceId || undefined, selectedProject || undefined);
    } else {
      onConnect(apiKey, workspaces, selectedWorkspaceId || undefined, selectedProject || undefined);
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
    setSelectedWorkspaceId(null);
    setSelectedProject(null);
    setSelectedProjectId(null);
    setWorkspaces([]);
  };

  if (isProxyMode) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-gray-900">
              Connected to Motion
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              You're connected to Motion via the application proxy.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Successfully connected to Motion via application proxy. No API key required.
                </AlertDescription>
              </Alert>
              
              {selectedWorkspaceId && (
                <div className="space-y-2">
                  <Label>Selected Workspace</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    {workspaces.find(w => w.id === selectedWorkspaceId)?.name || 'Default Workspace'}
                  </div>
                  
                  <ProjectSelect
                    apiKey="proxy_mode"
                    workspaceId={selectedWorkspaceId}
                    selectedProject={selectedProject}
                    onProjectSelect={handleProjectSelect}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-2 pb-4 px-6">
            <Button 
              onClick={handleConnect}
              className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
                {apiKey && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleClearApiKey}
                    title="Clear API Key"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                )}
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
              
              <div className="flex justify-end mt-2">
                <Button
                  onClick={validateKey}
                  disabled={!apiKey.trim() || isValidating}
                  size="sm"
                >
                  {isValidating ? (
                    <>
                      <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                      Validating...
                    </>
                  ) : isKeyValid === true ? (
                    <>
                      <CheckIcon className="mr-2 h-3 w-3 text-green-500" />
                      Validated
                    </>
                  ) : (
                    "Validate Key"
                  )}
                </Button>
              </div>
            </div>
            
            {isKeyValid && (
              <>
                <WorkspaceSelect 
                  apiKey={apiKey} 
                  selectedWorkspaceId={selectedWorkspaceId}
                  onWorkspaceSelect={handleWorkspaceSelect}
                />
                
                {selectedWorkspaceId && (
                  <ProjectSelect
                    apiKey={apiKey}
                    workspaceId={selectedWorkspaceId}
                    selectedProject={selectedProject}
                    onProjectSelect={handleProjectSelect}
                  />
                )}
              </>
            )}
            
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
            onClick={handleConnect}
            disabled={!isKeyValid || !selectedWorkspaceId || isValidating}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isValidating ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect & Continue"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MotionApiConnect;
