import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';

const MODULES = [
  { icon: '🎓', key: 'extras.module_1' },
  { icon: '🔧', key: 'extras.module_2' },
  { icon: '⚡', key: 'extras.module_3' },
  { icon: '💻', key: 'extras.module_4' },
  { icon: '🚗', key: 'extras.module_5' },
  { icon: '📷', key: 'extras.module_6' },
  { icon: '🎤', key: 'extras.module_7' },
  { icon: '📖', key: 'extras.module_8' },
  { icon: '🔍', key: 'extras.module_9' },
  { icon: '🗺️', key: 'extras.module_10' },
  { icon: '🏪', key: 'extras.module_11' },
  { icon: '👨‍🏫', key: 'extras.module_12' },
  { icon: '🏫', key: 'extras.module_13' },
  { icon: '🤖', key: 'extras.module_14' },
  { icon: '🌍', key: 'extras.module_15' },
] as const;

export const Modules = () => {
  const { t } = useTranslation();

  return (
    <section id="modules" className="relative overflow-hidden bg-ink py-24 text-white">
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A1628_0%,#0C1B31_50%,#0A1628_100%)]" />
        <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] mask-fade-edges opacity-40" />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-teal/10 blur-[130px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-blue/25 blur-[130px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <LayoutGrid className="h-3.5 w-3.5" />
            {t('extras.modules_badge')}
          </span>

          <h2 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t('extras.modules_title')}
          </h2>

          <p className="mt-5 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('extras.modules_desc')}
          </p>
        </div>

        {/* ---------- Module grid ---------- */}
        <ul className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MODULES.map((module, index) => (
            <li
              key={module.key}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-teal/40 hover:bg-white/[0.07] hover:shadow-glow"
            >
              {/* left accent bar revealed on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-brand-teal to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink/60 text-lg leading-none"
              >
                {module.icon}
              </span>

              <span className="text-sm font-medium text-slate-200 transition-colors group-hover:text-white">
                {t(module.key)}
              </span>

              <span className="ml-auto font-mono text-[10px] text-slate-600 transition-colors group-hover:text-brand-teal/70">
                {String(index + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ul>

        {/* ---------- Footer note ---------- */}
        <p className="mt-10 text-center text-sm text-slate-500">
          {t('extras.modules_note')}
        </p>
      </div>
    </section>
  );
};
