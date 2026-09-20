import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtitle,
  iconColor = 'text-rukoob-gold',
}) => {
  return (
    <div className="card-glass p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-rukoob-gold/60 group shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold font-outfit text-slate-900 dark:text-slate-100 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-rukoob-forest/60 border border-slate-200 dark:border-rukoob-gold/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {change && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400">مقارنة بالأسبوع الماضي</span>
        </div>
      )}
    </div>
  );
};
