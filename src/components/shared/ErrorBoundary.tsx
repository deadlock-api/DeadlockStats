import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorMessage } from "./ErrorMessage";
import { reportCrash, ErrorType } from "src/utils/crashReporting";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to crash reporting service
    reportCrash(error, ErrorType.HANDLED);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorMessage
          titleTx="performanceScreen:errorTitle"
          messageTx="performanceScreen:errorMessage"
          retryTx="performanceScreen:retryLoading"
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
