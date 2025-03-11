
import React from 'react';
import { AppProvider } from './AppContext';
import AppContent from './AppContent';

const IndexRefactored = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default IndexRefactored;
