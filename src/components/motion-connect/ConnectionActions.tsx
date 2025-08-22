
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckIcon, LoaderIcon } from 'lucide-react';

interface ConnectionActionsProps {
  apiKey: string;
  isValidating: boolean;
  isKeyValid: boolean | null;
  onValidate: () => void;
}

const ConnectionActions: React.FC<ConnectionActionsProps> = ({
  apiKey,
  isValidating,
  isKeyValid,
  onValidate
}) => {
  return (
    <div className="flex justify-end pt-2 pb-4 px-6">
      <Button 
        onClick={onValidate}
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
    </div>
  );
};

export default ConnectionActions;
