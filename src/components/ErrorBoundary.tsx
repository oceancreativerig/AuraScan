import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 tracking-tight">System Error</h2>
            <p className="text-[var(--text-secondary)] mb-10 text-sm leading-relaxed font-light">
              An unexpected biometric processing error occurred. Our technical team has been alerted. Please initialize the application again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-card)] font-bold rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
            >
              <RefreshCw className="w-5 h-5" />
              Re-initialize AuraScan
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
