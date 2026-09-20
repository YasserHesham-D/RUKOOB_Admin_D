import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  src: string;
  title: string;
  type?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ src, title, type }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="bg-white dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/50 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-rukoob-forest/30 border-b border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-rukoob-gold">{title}</span>
          {type && <span className="text-slate-500">({type})</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            title="تكبير"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="تصغير"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            title="تدوير"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح بالكامل"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="p-4 bg-slate-100 dark:bg-black/40 min-h-[260px] flex items-center justify-center overflow-auto relative select-none">
        <img
          src={src}
          alt={title}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out',
          }}
          className="max-h-[320px] object-contain rounded shadow-md"
        />
      </div>
    </div>
  );
};
