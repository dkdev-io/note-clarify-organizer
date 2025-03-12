
import React from 'react';
import { AppProvider } from './context/AppContextProvider';
import AppContent from './AppContent';

const IndexRefactored = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default IndexRefactored;
