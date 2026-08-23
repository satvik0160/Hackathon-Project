import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <div className="card p-8 max-w-md text-center flex flex-col items-center" style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '2rem' }}>
            <div className="mb-4 text-red-500">
              <AlertTriangle size={64} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-6 opacity-80">
              Our interface encountered an unexpected glitch. Don't worry, your progress is safe.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white' }}
            >
              <RefreshCcw size={16} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
