import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
    danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30',
    info: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30',
    neutral: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-500/30',
    gold: 'bg-amber-50 dark:bg-rukoob-gold/10 text-amber-900 dark:text-rukoob-gold border-amber-300 dark:border-rukoob-gold/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-600 dark:bg-emerald-400'
              : variant === 'warning'
              ? 'bg-amber-600 dark:bg-amber-400'
              : variant === 'danger'
              ? 'bg-rose-600 dark:bg-rose-400'
              : variant === 'gold'
              ? 'bg-amber-600 dark:bg-rukoob-gold'
              : 'bg-slate-600 dark:bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};
