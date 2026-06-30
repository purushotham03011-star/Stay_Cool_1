import React from 'react';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'list' | 'circle';
  count?: number;
  className?: string;
}

/**
 * Animated Pulse Skeleton state mockup, preventing screen layout flickering during data fetching.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array(count).fill(0);

  const renderSkeleton = (key: number) => {
    switch (variant) {
      case 'circle':
        return (
          <div key={key} className={`flex items-center space-x-3 p-3 ${className}`}>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 animate-pulse" />
              <div className="h-2.5 bg-slate-150 dark:bg-slate-750 rounded-md w-2/3 animate-pulse" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div key={key} className={`w-full divide-y divide-slate-100 ${className}`}>
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center py-3.5 px-4">
                <div className="h-3 bg-slate-200 rounded-md w-1/4 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-1/6 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-1/5 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-1/12 animate-pulse mr-2" />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div key={key} className={`p-4 bg-white rounded-2xl border border-slate-150 space-y-3 ${className}`}>
            <div className="h-3.5 bg-slate-200 rounded-md w-1/2 animate-pulse" />
            <div className="h-2.5 bg-slate-150 rounded-md w-5/6 animate-pulse" />
            <div className="h-2 bg-slate-100 rounded-md w-2/3 animate-pulse" />
          </div>
        );

      case 'card':
      default:
        return (
          <div key={key} className={`bg-white rounded-2xl border border-slate-150 p-5 space-y-4 shadow-xs ${className}`}>
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded-md w-2/5 animate-pulse" />
                <div className="h-2.5 bg-slate-150 rounded-md w-1/4 animate-pulse" />
              </div>
              <div className="w-14 h-6 bg-slate-150 rounded-lg animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>

            <div className="flex space-x-2 pt-2">
              <div className="h-4 bg-slate-100 rounded-md flex-1 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md flex-1 animate-pulse" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 w-full">
      {items.map((_, i) => renderSkeleton(i))}
    </div>
  );
};
