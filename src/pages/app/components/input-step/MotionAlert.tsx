
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MotionAlertProps {
  handleReconnect: () => void;
}

const MotionAlert: React.FC<MotionAlertProps> = ({ handleReconnect }) => {
  return (
    <Alert variant="destructive" className="mb-4 bg-amber-50 border-amber-300">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-800">User Information Missing</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          We couldn't load your Motion users list. This may limit task assignee verification.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-400 text-amber-700 hover:bg-amber-100 flex items-center"
            onClick={handleReconnect}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect to Motion
          </Button>
          <p className="text-xs pt-1 sm:pt-0">
            Or continue anyway - assignee names won't be verified against your Motion account.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default MotionAlert;
