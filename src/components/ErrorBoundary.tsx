import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    if (confirm('This will clear your local database cache and reset the app. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 selection:bg-rose-500 selection:text-white font-sans">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl shadow-2xl text-center space-y-6 z-10 relative">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/10 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-display">Something went wrong</h1>
              <p className="text-xs text-slate-450 leading-relaxed">
                The application encountered an unexpected runtime error. This is usually caused by outdated or corrupted local storage presets.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-left text-[11px] font-mono text-rose-455 overflow-x-auto max-h-[120px] shadow-inner">
                <span className="font-bold text-rose-400">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-650 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-tr from-rose-600 to-rose-700 hover:from-rose-550 hover:to-rose-650 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 shadow-md shadow-rose-900/15"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Database</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
