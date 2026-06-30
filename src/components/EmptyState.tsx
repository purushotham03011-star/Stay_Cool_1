import React from 'react';
import { Sparkles, Database, FileX, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'empty' | 'search' | 'clean';
  className?: string;
}

/**
 * Beautiful illustrative fallback state.
 * Accommodates empty tables, failed filter searches, and pristine storage boards.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are currently no active system items in this division.',
  actionLabel,
  onAction,
  icon = 'empty',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white border border-slate-150 rounded-2xl text-center max-w-sm mx-auto shadow-xs ${className}`}>
      
      {/* Dynamic graphic illustration based on selection */}
      <div className="mb-4">
        {icon === 'search' ? (
          <div className="p-4 bg-amber-50 rounded-full border border-amber-100 text-amber-500 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
        ) : icon === 'clean' ? (
          <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-500">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border rounded-full text-slate-400">
            <FileX className="w-8 h-8" />
          </div>
        )}
      </div>

      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight font-display">
        {title}
      </h4>
      <p className="text-xs text-slate-450 mt-1 mb-5 leading-relaxed max-w-[280px] mx-auto">
        {description}
      </p>

      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
