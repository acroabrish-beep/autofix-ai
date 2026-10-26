import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-28">
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A1628_0%,#0C1B31_50%,#0A1628_100%)]" />
        <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] mask-fade-edges opacity-40" />
        {/* Teal glow — the signature accent */}
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/15 blur-[140px]" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-blue/25 blur-[130px]" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-teal/10 blur-[130px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <Sparkles className="h-3.5 w-3.5" />
            {t('extras.cta_badge')}
          </span>

          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t('extras.cta_title_1')}{' '}
            <span className="bg-[linear-gradient(120deg,#FFFFFF_20%,#9FD8E8_55%,#00B4D8_100%)] bg-clip-text text-transparent">
              {t('extras.cta_title_2')}
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            {t('extras.cta_desc')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="group h-14 w-full rounded-xl bg-brand-teal px-9 text-base font-semibold text-ink shadow-glow transition-all hover:bg-brand-teal/90 hover:shadow-glow-lg sm:w-auto"
            >
              {t('extras.cta_button')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="h-14 w-full rounded-xl border-2 border-white/25 bg-white/5 px-9 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/45 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              {t('auth.sign_in')}
            </Button>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            {t('extras.cta_note')}
          </p>
        </div>
      </div>
    </section>
  );
};
