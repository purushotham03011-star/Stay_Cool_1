import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
  className?: string;
}

/**
 * Reusable layout Search bar for searching hotels, rooms, booking names, or tenant tables.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  placeholder = 'Search by name, room, status...',
  isLoading = false,
  onClear,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Starting search magnifier */}
      <div className="absolute left-3.5 text-slate-400 select-none pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs text-slate-800 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-2xl pl-10 pr-10 py-3.5 transition duration-150 outline-none"
      />

      {/* Clear trigger */}
      {query && (
        <button
          type="button"
          onClick={onClear ? onClear : () => onChange('')}
          className="absolute right-3.5 p-1 text-slate-350 hover:text-slate-650 hover:bg-slate-50 rounded-full transition cursor-pointer"
          title="Clear search parameter"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
