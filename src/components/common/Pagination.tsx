import React from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
}) => {
  const effectiveTotalPages = Math.max(1, totalPages || Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (effectiveTotalPages <= 5) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', effectiveTotalPages);
      } else if (currentPage >= effectiveTotalPages - 2) {
        pages.push(1, '...', effectiveTotalPages - 3, effectiveTotalPages - 2, effectiveTotalPages - 1, effectiveTotalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', effectiveTotalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${className}`}
    >
      {/* Items info & Page Size selector */}
      <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
        <span>
          عرض <strong className="text-slate-900 dark:text-white font-outfit">{startItem}</strong> -{' '}
          <strong className="text-slate-900 dark:text-white font-outfit">{endItem}</strong> من أصل{' '}
          <strong className="text-slate-900 dark:text-white font-outfit">{totalItems}</strong> عنصر
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">لكل صفحة:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-outfit font-bold cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5" dir="rtl">
        {/* First Page */}
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          title="الصفحة الأولى"
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-rukoob-forest/20 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="الصفحة السابقة"
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-rukoob-forest/20 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-bold"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">السابق</span>
        </button>

        {/* Number buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none">
                  ...
                </span>
              );
            }
            const isSelected = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-outfit font-bold transition-all ${
                  isSelected
                    ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                    : 'bg-slate-100 dark:bg-rukoob-forest/20 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          disabled={currentPage >= effectiveTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="الصفحة التالية"
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-rukoob-forest/20 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-bold"
        >
          <span className="hidden sm:inline">التالي</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          disabled={currentPage >= effectiveTotalPages}
          onClick={() => onPageChange(effectiveTotalPages)}
          title="الصفحة الأخيرة"
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-rukoob-forest/20 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
