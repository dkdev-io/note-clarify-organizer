
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckIcon, LoaderIcon, InfoIcon, LinkIcon, RefreshCwIcon } from 'lucide-react';
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
  const { toast } = useToast();

  // Add useEffect to monitor the API key input
  useEffect(() => {
    // Reset validation state when the API key changes
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
    
    // Trim the API key to remove any accidental whitespace and quotes
    const trimmedKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    setIsValidating(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting API key validation...');
      // Set the API key globally first
      setMotionApiKey(trimmedKey);
      
      const isValid = await validateMotionApiKey(trimmedKey);
      setIsKeyValid(isValid);
      
      if (isValid) {
        // If valid, fetch workspaces
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
      } else {
        setErrorMessage(
          "Invalid Motion API key. Please check the key and try again. " +
          "Make sure you are using an API key created in your Motion account settings with proper permissions."
        );
        toast({
          title: "Connection Error",
          description: "Invalid Motion API key - check for whitespace or quotes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during validation:", error);
      setErrorMessage(
        "Failed to validate API key. Please check your internet connection and try again."
      );
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

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    // Reset project when workspace changes
    setSelectedProject(null);
    setSelectedProjectId(null);
  };

  const handleProjectSelect = (projectName: string, projectId?: string) => {
    setSelectedProject(projectName);
    setSelectedProjectId(projectId || null);
  };

  const handleConnect = () => {
    onConnect(apiKey, workspaces, selectedWorkspaceId || undefined, selectedProject || undefined);
  };

  const handleMotionDocsClick = () => {
    window.open('https://docs.usemotion.com/docs/api/authentication', '_blank');
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
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600 underline-offset-2 font-normal flex items-center mt-1"
                    onClick={handleMotionDocsClick}
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    View Motion API docs
                  </Button>
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
