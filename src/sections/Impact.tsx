import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, GraduationCap, TrendingDown, Users, Target } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

interface CounterProps {
  value: number;
  suffix?: string;
  started: boolean;
  duration?: number;
}

const Counter: React.FC<CounterProps> = ({ value, suffix = '', started, duration = 1800 }) => {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!started) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [started, value, duration]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SDGS = [
  {
    number: '4',
    titleKey: 'extras.sdg4_title',
    descriptionKey: 'extras.sdg4_desc',
    color: '#C5192D',
  },
  {
    number: '8',
    titleKey: 'extras.sdg8_title',
    descriptionKey: 'extras.sdg8_desc',
    color: '#A21942',
  },
  {
    number: '9',
    titleKey: 'extras.sdg9_title',
    descriptionKey: 'extras.sdg9_desc',
    color: '#FD6925',
  },
] as const;

const STATS = [
  {
    icon: Users,
    value: 500000,
    suffix: '+',
    labelKey: 'extras.stat_students',
  },
  {
    icon: TrendingDown,
    value: 30,
    suffix: '%',
    labelKey: 'extras.stat_costs',
  },
  {
    icon: GraduationCap,
    value: 10000,
    suffix: '+',
    labelKey: 'extras.stat_graduates',
  },
  {
    icon: Target,
    value: 1000000,
    suffix: '+',
    labelKey: 'extras.stat_users',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export const Impact = () => {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="impact" className="relative overflow-hidden bg-ink py-24 text-white">
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A1628_0%,#0C1B31_55%,#0A1628_100%)]" />
        <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] mask-fade-edges opacity-40" />
        <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-brand-teal/12 blur-[130px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-blue/25 blur-[130px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <Target className="h-3.5 w-3.5" />
            {t('extras.impact_badge')}
          </span>

          <h2 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t('extras.impact_title')}
          </h2>

          <p className="mt-5 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
            {t('extras.impact_desc')}
          </p>
        </div>

        {/* ---------- SDG cards ---------- */}
        <ul className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
          {SDGS.map((sdg) => (
            <li
              key={sdg.number}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
            >
              {/* SDG accent bar */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: sdg.color }}
              />

              <div className="flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-xl font-bold text-white"
                  style={{ backgroundColor: sdg.color }}
                >
                  {sdg.number}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t('extras.un_sdg')}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-white">
                {t(sdg.titleKey)}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">{t(sdg.descriptionKey)}</p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors group-hover:text-brand-teal">
                {t('extras.sdg_number', { number: sdg.number })}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </li>
          ))}
        </ul>

        {/* ---------- Animated stats ---------- */}
        <div
          ref={statsRef}
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map(({ icon: Icon, value, suffix, labelKey }) => (
            <div
              key={labelKey}
              className="flex flex-col items-center bg-ink px-6 py-10 text-center transition-colors duration-300 hover:bg-ink-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-teal/25 bg-brand-teal/10 text-brand-teal">
                <Icon className="h-5 w-5" />
              </span>

              <div className="mt-5 bg-[linear-gradient(120deg,#FFFFFF_30%,#00B4D8_100%)] bg-clip-text font-mono text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                <span aria-hidden="true">
                  <Counter value={value} suffix={suffix} started={started} />
                </span>
                <span className="sr-only">
                  {value.toLocaleString('en-US')}
                  {suffix} {t(labelKey)}
                </span>
              </div>

              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {t(labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
