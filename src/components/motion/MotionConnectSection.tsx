
import React, { useEffect, useState } from 'react';
import ConnectMotionButton from './ConnectMotionButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MotionConnectSection = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Check if already connected to Motion
    const isUsingMotionProxy = sessionStorage.getItem('using_motion_proxy') === 'true';
    setIsConnected(isUsingMotionProxy);
  }, []);
  
  // If already connected, don't show the connect section
  if (isConnected) {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Connect with Motion</CardTitle>
        <CardDescription>
          Connect your Motion account to enable full functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-2">
          <ConnectMotionButton />
        </div>
      </CardContent>
    </Card>
  );
};

export default MotionConnectSection;
