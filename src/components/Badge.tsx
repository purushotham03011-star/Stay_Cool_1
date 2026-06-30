import React from 'react';

export type StatusType = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning' | 'Paid' | 'Pending';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'teal';
  type?: StatusType;
  className?: string;
}

/**
 * Reusable Badge / Pill utility designed to mark room, invoice, booking and property states.
 * Fully formatted with animated indicators for high visual quality.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  type,
  className = '',
}) => {
  // Mapping of exact requested status states to beautiful color values and titles
  if (type) {
    const statusConfig: Record<StatusType, { bg: string; text: string; dot: string; label: string }> = {
      Available: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-150",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        label: "Available"
      },
      Occupied: {
        bg: "bg-indigo-50 text-indigo-700 border-indigo-150",
        text: "text-indigo-700",
        dot: "bg-indigo-600",
        label: "Occupied"
      },
      Reserved: {
        bg: "bg-cyan-50 text-cyan-700 border-cyan-150",
        text: "text-cyan-700",
        dot: "bg-cyan-500",
        label: "Reserved"
      },
      Maintenance: {
        bg: "bg-rose-50 text-rose-700 border-rose-150",
        text: "text-rose-700",
        dot: "bg-rose-500",
        label: "Maintenance"
      },
      Cleaning: {
        bg: "bg-amber-50 text-amber-700 border-amber-150",
        text: "text-amber-700",
        dot: "bg-amber-500",
        label: "Cleaning"
      },
      Paid: {
        bg: "bg-teal-55 text-teal-800 border-teal-200",
        text: "text-teal-800",
        dot: "bg-teal-600",
        label: "Paid"
      },
      Pending: {
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        text: "text-amber-800",
        dot: "bg-amber-550",
        label: "Pending"
      }
    };

    const config = statusConfig[type] || statusConfig.Available;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.bg} ${className}`.trim()}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{children || config.label}</span>
      </span>
    );
  }

  // Non-dynamic basic theme badge
  const variants = {
    slate: "bg-slate-50 text-slate-600 border border-slate-150",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-150",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-150",
    amber: "bg-amber-55/10 text-amber-800 border border-amber-150",
    rose: "bg-rose-50 text-rose-700 border border-rose-150",
    cyan: "bg-cyan-50 text-cyan-700 border border-cyan-150",
    teal: "bg-teal-50 text-teal-800 border border-teal-150",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md ${variants[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
};

// Shorthand badge component utilities
export const AvailableBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Available" className={className} />;
export const OccupiedBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Occupied" className={className} />;
export const ReservedBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Reserved" className={className} />;
export const MaintenanceBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Maintenance" className={className} />;
export const CleaningBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Cleaning" className={className} />;
export const PaidBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Paid" className={className} />;
export const PendingBadge: React.FC<{ className?: string }> = ({ className }) => <Badge type="Pending" className={className} />;
