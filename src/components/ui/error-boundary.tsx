"use client";

import { Button } from "@/components/ui/button";
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
    // You could log this to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-sm text-red-600 mt-1">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}