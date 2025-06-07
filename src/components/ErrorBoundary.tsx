import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initialize state so the normal children are rendered initially
    this.state = { hasError: false };
  }

  /**
   * This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * @param error The error that was thrown.
   * @returns An object to update state, or null to update nothing.
   */
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    console.error("ErrorBoundary caught an error (getDerivedStateFromError):", error);
    return { hasError: true };
  }

  /**
   * This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives two parameters:
   * 1. error - The error that was thrown.
   * 2. errorInfo - An object with a componentStack key containing information about which
   *    component threw the error.
   * @param error The error that was thrown.
   * @param errorInfo Information about the component that threw the error.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error (componentDidCatch):", error, errorInfo);
    // Example: logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ff0000', margin: '20px' }}>
          <h1>Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page, or contact support if the problem persists.</p>
          {/* Optionally, provide a button to try reloading the page or a specific component part */}
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px' }}>
            Refresh Page
          </button>
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
