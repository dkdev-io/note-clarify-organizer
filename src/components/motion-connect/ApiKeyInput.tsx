
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, InfoIcon, Trash as TrashIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isKeyValid: boolean | null;
  errorMessage: string | null;
  rememberKey: boolean;
  setRememberKey: (remember: boolean) => void;
  handleClearApiKey: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  setApiKey,
  isKeyValid,
  errorMessage,
  rememberKey,
  setRememberKey,
  handleClearApiKey
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">Motion API Key</Label>
      <div className="flex gap-2">
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your Motion API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
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
          Connect your Motion account to automatically create tasks from your notes.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiKeyInput;
