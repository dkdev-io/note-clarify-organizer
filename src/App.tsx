
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import IndexRefactored from './pages/app/IndexRefactored';
import Landing from './pages/landing';
import ConverterPage from './pages/converter';
import { AppProvider } from './pages/app/context/AppContextProvider';
import { 
  IssuesListPage, 
  IssueCreatePage, 
  IssueEditPage, 
  IssueDetailPage 
} from './pages/issues';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Landing page as the default route */}
          <Route path="/" element={<Landing />} />
          
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected app routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppProvider>
                <Routes>
                  {/* Default app route redirects to converter */}
                  <Route path="/" element={<Navigate to="/app/converter" replace />} />
                  
                  {/* Task converter routes */}
                  <Route path="converter" element={<IndexRefactored />} />
                  <Route path="converter/legacy" element={<ConverterPage />} />
                  
                  {/* Issue tracking routes */}
                  <Route path="issues" element={<IssuesListPage />} />
                  <Route path="issues/new" element={<IssueCreatePage />} />
                  <Route path="issues/:id" element={<IssueDetailPage />} />
                  <Route path="issues/edit/:id" element={<IssueEditPage />} />
                  
                  {/* Catch-all for unknown /app routes */}
                  <Route path="*" element={<Navigate to="/app/converter" replace />} />
                </Routes>
              </AppProvider>
            </ProtectedRoute>
          } />
          
          {/* Catch-all for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
