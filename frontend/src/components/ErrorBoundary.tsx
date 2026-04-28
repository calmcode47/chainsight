import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("📍 ErrorBoundary: Caught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050814] text-white flex flex-col items-center justify-center p-8 text-center font-inter border-t-4 border-rose-500">
          <div className="bg-rose-500/10 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">System Interruption</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            We've encountered a rendering exception. This has been logged and we're working on a fix.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
            >
              Return Home
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-12 p-4 bg-black/50 rounded border border-white/5 text-left text-[10px] text-gray-500 max-w-2xl overflow-auto font-mono">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
