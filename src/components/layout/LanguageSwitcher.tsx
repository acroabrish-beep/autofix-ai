import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  /** `dark` for the navbar/hero, `light` for white surfaces. */
  tone?: 'dark' | 'light';
  /** Stretch the control to the full width (mobile sheet). */
  fullWidth?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  tone = 'dark',
  fullWidth = false,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'flex items-center gap-0.5 rounded-full border p-0.5',
        tone === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
        fullWidth && 'w-full',
        className
      )}
    >
      <Globe
        aria-hidden="true"
        className={cn(
          'ml-1.5 h-3.5 w-3.5 shrink-0',
          tone === 'dark' ? 'text-slate-400' : 'text-slate-500'
        )}
      />
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = currentLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => void changeLanguage(language.code)}
            aria-pressed={isActive}
            aria-label={language.label}
            title={language.label}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-bold leading-none transition-colors',
              fullWidth && 'flex-1',
              isActive
                ? 'bg-brand-teal text-ink shadow-sm'
                : tone === 'dark'
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-brand-blue'
            )}
          >
            {language.short}
          </button>
        );
      })}
    </div>
  );
};
