import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Map Failed to Load
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  There was an error loading the map. Please try refreshing the page.
                </p>
                {this.state.error && (
                  <details className="text-xs text-gray-500 mt-2 max-w-md">
                    <summary className="cursor-pointer hover:text-gray-700">Error Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
                      {this.state.error.toString()}
                      {this.state.error.stack && (
                        <>
                          {'\n\n'}
                          {this.state.error.stack}
                        </>
                      )}
                    </pre>
                  </details>
                )}
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;

