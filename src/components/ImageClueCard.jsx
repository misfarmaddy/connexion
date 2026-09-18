// CONNEXION - Image Clue Card (Bright Festive Theme)
import React, { useState } from "react";
import { Maximize2, X, Image as ImageIcon } from "lucide-react";

export default function ImageClueCard({ clue, index, totalClues = 4, isLarge = false, showLabel = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const displayAlt = showLabel && clue.label ? clue.label : `Clue ${index + 1}`;

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-purple-200 bg-white p-2 shadow-md hover:shadow-xl hover:border-pink-500 hover:scale-[1.02] transition-all duration-300"
      >
        {/* Clue Badge */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-purple-800 shadow-sm border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          Clue #{index + 1}
        </div>

        {/* Zoom Hint */}
        <div className="absolute top-3.5 right-3.5 z-10 rounded-full bg-white/90 p-1.5 text-purple-700 shadow-sm border border-purple-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>

        {/* Image Container */}
        <div className={`overflow-hidden rounded-xl bg-purple-50 ${isLarge ? "h-64 sm:h-80 md:h-96" : "h-44 sm:h-52 md:h-60"}`}>
          {!hasError ? (
            <img
              src={clue.url}
              alt={displayAlt}
              onError={() => setHasError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-purple-50 text-purple-400">
              <ImageIcon className="w-8 h-8 opacity-60" />
              <span className="text-xs font-bold">Clue Image #{index + 1}</span>
            </div>
          )}
        </div>

        {/* Subtitle / Caption - Only displayed for Admin or when showLabel is explicitly enabled */}
        {showLabel && clue.label && (
          <div className="mt-2 px-1 pb-1">
            <p className="text-xs font-bold text-slate-700 truncate">
              {clue.label}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full overflow-hidden rounded-3xl bg-white border-2 border-purple-300 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-purple-100">
              <span className="text-sm font-black text-purple-900">
                Clue #{index + 1} of {totalClues}{showLabel && clue.label ? `: ${clue.label}` : ""}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center p-2 max-h-[78vh]">
              <img
                src={clue.url}
                alt={displayAlt}
                className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
