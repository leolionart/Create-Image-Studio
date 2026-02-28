import React from 'react';
import { Template } from '../../types';

interface GalleryCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  index: number;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ template, onSelect, index }) => {
  const hasInputImages = template.inputImages.length > 0;
  const hasOutputImage = !!template.outputImage;
  const isTextOnly = template.inputsNeeded === 0;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(template)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(template); } }}
      className="group relative cursor-pointer rounded-3xl overflow-hidden bg-surface-container shadow-elevation-1 transition-[transform,box-shadow] duration-300 ease-spring hover:-translate-y-1.5 hover:shadow-elevation-2 active:scale-[0.97] active:shadow-none active:duration-100 active:ease-out focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 animate-card-in"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* === Image Section === */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-highest">
        {isTextOnly || !hasInputImages ? (
          /* --- Text-to-Image: output only with gradient overlay --- */
          <>
            {hasOutputImage ? (
              <img
                src={template.outputImage}
                alt={template.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-md-standard group-hover:scale-[1.06]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-container/20">
                <span className="material-symbols-outlined text-primary/40" style={{ fontSize: 64 }}>palette</span>
              </div>
            )}
            {/* Scrim gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-scrim/60 via-scrim/10 to-transparent pointer-events-none" />
            {/* Text to Image badge */}
            {isTextOnly && (
              <div className="absolute top-3 left-3 h-7 inline-flex items-center gap-1.5 px-3 rounded-full bg-primary/90 text-on-primary text-xs font-medium backdrop-blur-sm">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                Text to Image
              </div>
            )}
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-base font-medium text-white leading-tight line-clamp-2 drop-shadow-sm">
                {template.title}
              </h3>
            </div>
          </>
        ) : (
          /* --- Before → After split --- */
          <>
            <div className="w-full h-full flex items-stretch">
              {/* Input side */}
              <div className="flex-1 relative overflow-hidden">
                {template.inputImages.length === 1 ? (
                  <img
                    src={template.inputImages[0]}
                    alt="Before"
                    className="w-full h-full object-cover transition-transform duration-500 ease-md-standard group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex">
                    {template.inputImages.slice(0, 2).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Input ${i + 1}`}
                        className="flex-1 h-full object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                {/* Before pill */}
                <div className="absolute top-2.5 left-2.5 h-6 inline-flex items-center px-2.5 rounded-full bg-scrim/50 text-white text-[11px] font-medium backdrop-blur-sm tracking-wide">
                  BEFORE
                </div>
                {template.inputImages.length > 2 && (
                  <div className="absolute bottom-2 left-2 h-5 inline-flex items-center px-2 rounded-full bg-scrim/60 text-white text-[10px] font-medium backdrop-blur-sm">
                    +{template.inputImages.length - 2} more
                  </div>
                )}
              </div>

              {/* Arrow divider — pill shaped */}
              <div className="w-9 flex items-center justify-center bg-surface-container shrink-0 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>arrow_forward</span>
                </div>
              </div>

              {/* Output side */}
              <div className="flex-1 relative overflow-hidden">
                {hasOutputImage ? (
                  <img
                    src={template.outputImage}
                    alt="After"
                    className="w-full h-full object-cover transition-transform duration-500 ease-md-standard group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 32 }}>image</span>
                  </div>
                )}
                {/* After pill */}
                <div className="absolute top-2.5 right-2.5 h-6 inline-flex items-center px-2.5 rounded-full bg-primary/80 text-on-primary text-[11px] font-medium backdrop-blur-sm tracking-wide">
                  AFTER
                </div>
              </div>
            </div>

            {/* Bottom scrim for text readability in before/after mode */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-scrim/40 to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* === Content Section === */}
      <div className="p-4 space-y-2">
        {/* Title row (only for before/after cards — text-only shows title on image) */}
        {!isTextOnly && hasInputImages && (
          <h3 className="text-sm font-medium text-on-surface leading-snug line-clamp-1">
            {template.title}
          </h3>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2">
          <span className="h-6 inline-flex items-center px-2.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-medium tracking-wide">
            {template.category}
          </span>
          <span className="text-xs text-on-surface-variant">@{template.author}</span>
          {template.inputsNeeded > 0 && (
            <span className="ml-auto text-[11px] text-outline flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_library</span>
              {template.inputsNeeded}
            </span>
          )}
        </div>

        {/* Prompt snippet */}
        <p className="text-xs text-on-surface-variant/70 leading-relaxed line-clamp-2">
          {template.prompt}
        </p>
      </div>

      {/* === M3E State layer overlay === */}
      <div
        className="absolute inset-0 rounded-3xl bg-on-surface opacity-0 group-hover:opacity-[0.05] group-active:opacity-[0.10] transition-opacity duration-150 ease-linear pointer-events-none"
        aria-hidden="true"
      />
    </article>
  );
};

export default GalleryCard;
