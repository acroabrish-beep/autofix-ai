import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /**
   * Colour treatment for the wordmark.
   * - "light" (default): dark navy text, for light surfaces.
   * - "dark": white text, for the dark navy navbar / footer surfaces.
   */
  tone?: 'light' | 'dark';
  /** Hide the wordmark and render only the mark. */
  markOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "h-8",
  tone = 'light',
  markOnly = false,
}) => {
  const isDark = tone === 'dark';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn(
          'h-8 w-8 shrink-0 transition-colors',
          isDark ? 'text-brand-teal' : 'text-brand-teal'
        )}
      >
        {/* Automotive Silhouette (Simplified) */}
        <path
          d="M3 13C3 13 4 10 7 9C10 8 14 8 17 9C20 10 21 13 21 13V16H3V13Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M3 13C3 13 4 10 7 9C10 8 14 8 17 9C20 10 21 13 21 13M3 16H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Wheels */}
        <circle cx="6.5" cy="16.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="16.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />

        {/* Lightning Bolt (Electrical/AI) */}
        <path
          d="M12 6L10 11H14L12 16"
          stroke="#4A90D9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI Circuit Point */}
        <circle cx="12" cy="6" r="1.5" fill="#4A90D9" />
      </svg>

      {!markOnly && (
        <span
          className={cn(
            'text-xl font-bold tracking-tight',
            isDark ? 'text-white' : 'text-brand-navy'
          )}
        >
          AutoFix <span className="text-brand-teal">AI</span>
        </span>
      )}
    </div>
  );
};
