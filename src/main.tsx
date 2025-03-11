
import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import App from './App.tsx';
import './index.css';
import React from 'react';

// Fallback loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-pulse">Loading application...</div>
  </div>
);

// Define proper types for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component with proper TypeScript types
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("App crashed:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <pre className="bg-gray-100 p-4 rounded text-left overflow-auto max-h-40 mb-4">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Make sure we have a valid DOM element before rendering
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render a basic loading message directly into the DOM before React renders
  rootElement.innerHTML = '<div class="min-h-screen flex items-center justify-center bg-white"><div class="animate-pulse">Initializing application...</div></div>';
  
  try {
    // Small delay to ensure the DOM has the initial message
    setTimeout(() => {
      createRoot(rootElement).render(
        <StrictMode>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <App />
            </Suspense>
          </ErrorBoundary>
        </StrictMode>
      );
    }, 0);
  } catch (error) {
    console.error("Failed to render application:", error);
    rootElement.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div class="max-w-md text-center">
          <h1 class="text-2xl font-bold text-red-600 mb-4">Rendering Error</h1>
          <p class="mb-4">The application failed to initialize.</p>
          <button
            onclick="window.location.reload()"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error("Root element not found!");
  document.body.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div class="max-w-md text-center">
        <h1 class="text-2xl font-bold text-red-600 mb-4">Root Element Missing</h1>
        <p class="mb-4">The application couldn't find the root element to render into.</p>
        <button
          onclick="window.location.reload()"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
