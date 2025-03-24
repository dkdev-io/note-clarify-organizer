
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default LoadingScreen;
