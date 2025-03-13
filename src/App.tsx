
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexRefactored from "./pages/app/IndexRefactored";
import Landing from "./pages/landing";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import { AppProvider } from "./pages/app/context/AppContextProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  // Create a new query client instance to avoid hydration issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  // Simple initialization check to ensure all dependencies are loaded
  useEffect(() => {
    // Perform any initialization checks here if needed
    setIsInitialized(true);
    console.log('App initialized - should show landing page by default');
  }, []);

  // Show a loading indicator until the app is fully initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">Starting application...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Always have landing page as the root route */}
              <Route path="/" element={<Landing />} />
              
              {/* Login page */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected app routes */}
              <Route 
                path="/app/*" 
                element={
                  <ProtectedRoute>
                    <AppProvider>
                      <IndexRefactored />
                    </AppProvider>
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect all other paths to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
