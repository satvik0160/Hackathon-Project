import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

/* Detects "stale deploy" failures: after a redeploy, a cached index.html can
   reference hashed chunks that no longer exist, so dynamic imports 404 and the
   page renders blank. Reloading once re-fetches the fresh HTML and fixes it;
   the timestamp guard prevents an infinite reload loop if the error is real. */
const CHUNK_ERROR_RE = /(failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|dynamically imported module.*failed|failed to load module script)/i;

function recoverFromChunkLoadFailure() {
  const KEY = 'dv:chunk-reload-at';
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last < 10_000) return false; // already retried recently
  sessionStorage.setItem(KEY, String(Date.now()));
  window.location.reload();
  return true;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error.stack, '\nComponent Stack:', errorInfo.componentStack);
    if (CHUNK_ERROR_RE.test(error?.message || '')) {
      recoverFromChunkLoadFailure();
    }
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
              Our interface encountered an unexpected glitch: {this.state.error?.message} - {this.state.error?.stack}
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
