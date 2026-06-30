import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Reusable Button component for the Hotel & PG Management System.
 * Mimics Ionic's clean layouts with pure Tailwind utility styling.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Base high fidelity touch-friendly styling
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  // Custom theme profiles matching the ecosystem design
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-indigo-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-500",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-xs focus:ring-rose-500",
    outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
    icon: "bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400 p-2 rounded-full",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2.5",
  };

  const selectedSize = variant === 'icon' ? '' : sizes[size];
  const combinedClasses = `${baseStyle} ${variants[variant]} ${selectedSize} ${className}`.trim();

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

// Direct component exports as shorthand alternatives
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="secondary" {...props} />;
export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="danger" {...props} />;
export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="outline" {...props} />;
export const IconButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => <Button variant="icon" {...props} />;
