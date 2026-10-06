import React, { useState } from 'react';
import logoImg from './logo.png';

interface LogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RukoobLogo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const [hasError, setHasError] = useState(false);

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
      {!hasError ? (
        <img
          src={logoImg}
          alt="RUKOOB"
          onError={() => setHasError(true)}
          style={{ width: pixelSize, height: pixelSize }}
          className="object-contain drop-shadow-md transition-transform hover:scale-105 shrink-0"
        />
      ) : (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className="rounded-2xl bg-gradient-to-br from-[#1B4D3E] via-[#0E2921] to-[#0A1C16] border border-[#C5A880]/60 shadow-md flex items-center justify-center shrink-0"
        >
          <span className="font-outfit font-black text-[#C5A880] text-xl tracking-tighter">
            R
          </span>
        </div>
      )}

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
