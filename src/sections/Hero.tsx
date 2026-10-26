import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { ArrowRight, Sparkles, Activity, Zap, Cpu, Languages, WifiOff, GraduationCap, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Languages, labelKey: 'hero.highlight_multilingual', detailKey: 'hero.highlight_multilingual_detail' },
  { icon: WifiOff, labelKey: 'hero.highlight_offline', detailKey: 'hero.highlight_offline_detail' },
  { icon: GraduationCap, labelKey: 'hero.highlight_tvet', detailKey: 'hero.highlight_tvet_detail' },
] as const;

const DIAGNOSTIC_CODES = [
  { code: 'P0301', textKey: 'hero.code_misfire', severity: 'Amber' },
  { code: 'P0171', textKey: 'hero.code_lean', severity: 'Teal' },
  { code: 'U0100', textKey: 'hero.code_comms', severity: 'Amber' },
] as const;

export const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const scrollToFeatures = useCallback(() => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-ink text-white"
    >
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Base gradient wash */}
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0A1628_0%,#0A1628_45%,#0B1C33_70%,#0A1628_100%)]" />
        {/* Teal signature glow behind the headline */}
        <div className="absolute left-1/2 top-0 h-[560px] w-[900px] max-w-full -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-teal/[0.13] blur-[150px]" />
        {/* Blue glow from the top */}
        <div className="absolute inset-0 bg-radial-fade" />
        {/* Abstract tech grid */}
        <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] mask-fade-edges opacity-70" />
        {/* Soft orbs */}
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-teal/20 blur-[120px] animate-float-slow" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-brand-blue/30 blur-[130px] animate-float" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-bright/10 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-brand-teal/[0.14] blur-[110px]" />
      </div>

      {/* Accent hairline at the very top of the hero */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-accent-sheen opacity-60" />

      <div className="container relative mx-auto px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          {/* ---------- Copy ---------- */}
          <div className="lg:col-span-6 xl:col-span-6">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <Sparkles className="h-3.5 w-3.5" />
              {t('hero.badge')}
            </span>

            <h1 className="mt-7 animate-fade-up text-balance text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              <span className="bg-[linear-gradient(120deg,#FFFFFF_25%,#9FD8E8_60%,#00B4D8_100%)] bg-clip-text text-transparent">
                AutoFix AI
              </span>
            </h1>

            <p className="mt-6 max-w-xl animate-fade-up text-pretty text-xl font-medium leading-snug text-slate-200 sm:text-2xl">
              {t('hero.subtitle')}
            </p>

            <p className="mt-5 animate-fade-up text-sm font-semibold uppercase tracking-[0.35em] text-brand-teal sm:text-base">
              {t('hero.tag_learn')} <span className="text-brand-teal/50">·</span> {t('hero.tag_diagnose')}{' '}
              <span className="text-brand-teal/50">·</span> {t('hero.tag_repair')}{' '}
              <span className="text-brand-teal/50">·</span> {t('hero.tag_empower')}
            </p>

            <p className="mt-6 max-w-xl animate-fade-up text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
              {t('hero.description')}
            </p>

            <div className="mt-10 flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="group h-14 rounded-xl bg-brand-teal px-8 text-base font-semibold text-ink shadow-glow transition-all hover:bg-brand-teal/90 hover:shadow-glow-lg"
              >
                {t('hero.start_learning')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="h-14 rounded-xl border-2 border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/45 hover:bg-white/10 hover:text-white"
              >
                {t('hero.see_features')}
              </Button>
            </div>

            {/* Trust / capability strip */}
            <dl className="mt-12 grid max-w-xl animate-fade-up grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, labelKey, detailKey }) => (
                <div key={labelKey} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-teal">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold text-white">{t(labelKey)}</dt>
                    <dd className="text-xs text-slate-400">{t(detailKey)}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------- Product visual ---------- */}
          <div className="relative lg:col-span-6 xl:col-span-6">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glow behind the panel */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[2rem] bg-brand-teal/15 blur-3xl"
              />

              <div className="relative animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-inner-top backdrop-blur-xl sm:p-7">
                {/* Scanning sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-[linear-gradient(to_bottom,transparent,rgba(0,180,216,0.14),transparent)]"
                />

                {/* Panel header */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-teal" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-teal" />
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-white">
                      {t('hero.live_diagnostics')}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    {t('hero.ecu_online')}
                  </span>
                </div>

                {/* Metrics */}
                <div className="relative mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                    <Activity className="mb-2 h-5 w-5 text-brand-teal" />
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">
                      {t('hero.engine_rpm')}
                    </div>
                    <div className="font-mono text-2xl text-white">4,250</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-ink/60 p-4">
                    <Zap className="mb-2 h-5 w-5 text-amber-400" />
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">
                      {t('hero.battery')}
                    </div>
                    <div className="font-mono text-2xl text-white">14.2V</div>
                  </div>
                </div>

                {/* Health ring */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="relative h-44 w-44">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#152C4A" strokeWidth="7" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#heroRing)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray="240 283"
                      />
                      <defs>
                        <linearGradient id="heroRing" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#4A90D9" />
                          <stop offset="100%" stopColor="#00B4D8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-4xl font-bold text-white">85%</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {t('hero.vehicle_health')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fault codes */}
                <div className="relative space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <Cpu className="h-4 w-4 text-brand-teal" />
                    {t('hero.detected_codes')}
                  </div>
                  {DIAGNOSTIC_CODES.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-ink/50 px-3.5 py-2.5"
                    >
                      <span className="font-mono text-sm text-brand-teal">{item.code}</span>
                      <span className="text-xs text-slate-300">{t(item.textKey)}</span>
                      <span
                        className={
                          item.severity === 'Teal'
                            ? 'h-2 w-2 rounded-full bg-brand-teal'
                            : 'h-2 w-2 rounded-full bg-amber-400'
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Repair confidence */}
                <div className="relative mt-6 rounded-2xl border border-brand-teal/25 bg-brand-teal/[0.07] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-brand-teal" />
                      {t('hero.repair_confidence')}
                    </span>
                    <span className="font-mono text-brand-teal">92%</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[92%] rounded-full bg-[linear-gradient(90deg,#4A90D9,#00B4D8)]" />
                  </div>
                </div>
              </div>

              {/* Floating offline chip */}
              <div className="absolute -bottom-5 -left-4 hidden animate-float items-center gap-2 rounded-2xl border border-white/10 bg-ink/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
                <WifiOff className="h-4 w-4 text-brand-teal" />
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-white">{t('hero.offline_active')}</div>
                  <div className="text-[10px] text-slate-400">{t('hero.cached_swahili')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
