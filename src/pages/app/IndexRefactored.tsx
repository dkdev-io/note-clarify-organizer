
import React from 'react';
import AppContent from './AppContent';
import { AppProvider } from './context/AppContextProvider';

const IndexRefactored = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default IndexRefactored;
