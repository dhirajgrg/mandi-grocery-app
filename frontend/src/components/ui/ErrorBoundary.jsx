import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to an external service in production if needed
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              An unexpected error occurred. Don&apos;t worry, your data is safe.
              Please try refreshing the page or go back to the home page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
                <p className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
              >
                <RefreshCw size={16} />
                Refresh Page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-light text-text font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                <Home size={16} />
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
