
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

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Landing page as the default route */}
          <Route path="/" element={<Landing />} />
          
          {/* Legacy task converter page (now protected) */}
          <Route path="/converter" element={
            <ProtectedRoute>
              <ConverterPage />
            </ProtectedRoute>
          } />
          
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected app route */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <IndexRefactored />
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
