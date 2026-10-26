import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Wrench, Car, Truck } from 'lucide-react';

const AUDIENCES = [
  {
    icon: GraduationCap,
    titleKey: 'who.students',
    descriptionKey: 'who.students_description',
  },
  {
    icon: Wrench,
    titleKey: 'who.mechanics',
    descriptionKey: 'who.mechanics_description',
  },
  {
    icon: Car,
    titleKey: 'who.owners',
    descriptionKey: 'who.owners_description',
  },
  {
    icon: Truck,
    titleKey: 'who.fleets',
    descriptionKey: 'who.fleets_description',
  },
] as const;

export const WhoWeServe = () => {
  const { t } = useTranslation();

  return (
    <section id="who-we-serve" className="relative overflow-hidden bg-brand-blue py-24 text-white">
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(0,180,216,0.18)_0%,rgba(26,58,107,0)_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-accent-sheen opacity-40" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t('who.title')}
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            {t('who.subtitle')}
          </p>
        </div>

        {/* ---------- Audience cards ---------- */}
        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, titleKey, descriptionKey }) => (
            <li
              key={titleKey}
              className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/40 hover:bg-white/[0.09]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-teal/25 bg-brand-teal/15 text-brand-teal transition-colors duration-300 group-hover:bg-brand-teal/25">
                <Icon className="h-6 w-6" />
              </span>

              <h3 className="mt-5 text-lg font-bold tracking-tight text-white">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{t(descriptionKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
