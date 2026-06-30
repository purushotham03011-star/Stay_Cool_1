import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterComponentProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  title?: string;
  className?: string;
  variant?: 'pills' | 'tabs' | 'chips';
}

/**
 * Filter select chips.
 * Extremely versatile segmented controls suitable for co-living/hotel filtering.
 */
export const FilterComponent: React.FC<FilterComponentProps> = ({
  options,
  selectedValue,
  onChange,
  title,
  className = '',
  variant = 'pills',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
          {title}
        </span>
      )}

      {variant === 'pills' && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-650 text-white border-indigo-650 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span className={`text-[10px] px-1.5 rounded-full font-bold font-mono ${
                    isSelected ? 'bg-indigo-805 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {variant === 'tabs' && (
        <div className="flex bg-slate-100 p-1 rounded-2xl border w-full max-w-sm">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
                  isSelected
                    ? 'bg-white shadow-xs text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {variant === 'chips' && (
        <div className="flex flex-wrap gap-1">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <span
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                }`}
              >
                {opt.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
