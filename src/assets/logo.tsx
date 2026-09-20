import React from 'react';

interface LogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RukoobLogo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 34
      : size === 'md'
      ? 44
      : size === 'lg'
      ? 60
      : 80;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official 3D Islamic Geometric Gold & Emerald Rukoob Logo */}
      <img
        src="/logo.png"
        alt="RUKOOB Logo"
        style={{ width: pixelSize, height: pixelSize }}
        className="object-contain drop-shadow-md transition-transform hover:scale-105 shrink-0"
      />

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-outfit font-black tracking-wider text-xl text-rukoob-forest-light dark:text-white">
              RUKOOB
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-rukoob-gold/20 text-rukoob-forest-light dark:text-rukoob-gold border border-rukoob-gold/40">
              Admin
            </span>
          </div>
          <span className="text-[11px] font-cairo font-bold text-slate-500 dark:text-slate-400">
            ركوب — لوحة التحكم
          </span>
        </div>
      )}
    </div>
  );
};
