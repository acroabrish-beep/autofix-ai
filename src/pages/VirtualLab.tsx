import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  CircleHelp,
  Gauge,
  Plug,
  ScanLine,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

type LabReading = {
  titleKey: string;
  value: string;
  detailKey: string;
  tone: 'green' | 'amber';
};

export const VirtualLab = () => {
  const { moduleId = '' } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reading, setReading] = useState<LabReading | null>(null);
  const moduleTitle = moduleId
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

  const testVoltage = () => {
    setReading({
      titleKey: 'lab.battery_test_title',
      value: '12.6 V',
      detailKey: 'lab.battery_test_detail',
      tone: 'green',
    });
  };

  const readObdCodes = () => {
    setReading({
      titleKey: 'lab.obd_test_title',
      value: 'P0301',
      detailKey: 'lab.obd_test_detail',
      tone: 'amber',
    });
  };

  return (
    <main className="min-h-screen bg-[#0b1015] text-slate-100">
      <header className="border-b border-white/10 bg-[#101820]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{t('lab.header')}</p>
              <p className="truncate text-xs text-slate-400">
                {moduleTitle || t('lab.module_fallback')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="shrink-0 gap-2 text-slate-300 hover:text-white"
            onClick={() => navigate(`/learning/${moduleId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('lab.back_module')}</span>
            <span className="sm:hidden">{t('lab.back')}</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-12">
        <section aria-labelledby="lab-title" className="min-w-0">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                {t('lab.training')}
              </p>
              <h1 id="lab-title" className="text-3xl font-bold text-white sm:text-4xl">
                {t('lab.title')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                {t('lab.intro')}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> {t('lab.online')}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#131c24] shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white">{t('lab.multimeter')}</h2>
                  <p className="text-xs text-slate-500">{t('lab.auto_ranging')}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <Plug className="h-4 w-4" /> {t('lab.connected')}
              </span>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-[1fr_180px] sm:p-8">
              <div className="flex min-h-56 flex-col justify-between rounded-lg border border-emerald-300/15 bg-[#09110f] p-5 sm:p-7">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>{t('lab.dc_voltage')}</span>
                  <span>V⎓</span>
                </div>
                <div className="py-8 text-center font-mono">
                  <span className="text-5xl font-semibold tracking-normal text-emerald-300 sm:text-6xl">
                    {reading?.value ?? '---'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>COM</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" /> VΩ
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-center justify-center gap-4 sm:flex-col">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-slate-700 bg-[#0d141a] text-amber-300 shadow-inner">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('lab.probe_status')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">{t('lab.ready')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-6">
              <Button
                onClick={testVoltage}
                className="h-12 justify-start gap-3 bg-emerald-400 text-[#07110d] hover:bg-emerald-300"
              >
                <BatteryCharging className="h-5 w-5" /> {t('lab.test_voltage')}
              </Button>
              <Button
                onClick={readObdCodes}
                className="h-12 justify-start gap-3 bg-cyan-300 text-[#071014] hover:bg-cyan-200"
              >
                <ScanLine className="h-5 w-5" /> {t('lab.read_obd')}
              </Button>
            </div>
          </div>

          <section
            aria-live="polite"
            aria-label={t('lab.output')}
            className="mt-5 min-h-24 rounded-xl border border-white/10 bg-[#111920] p-5"
          >
            {reading ? (
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    reading.tone === 'green' ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                />
                <div>
                  <p className="font-bold text-white">{t(reading.titleKey)}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{t(reading.detailKey)}</p>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <CircleHelp className="h-4 w-4" /> {t('lab.select_test')}
              </p>
            )}
          </section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-white/10 bg-[#131c24] p-5">
            <div className="mb-4 flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-bold text-white">{t('lab.safety_title')}</h2>
            </div>
            <ul className="space-y-3 text-sm leading-5 text-slate-400">
              <li>{t('lab.safety_1')}</li>
              <li>{t('lab.safety_2')}</li>
              <li>{t('lab.safety_3')}</li>
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#131c24] p-5">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <Activity className="h-5 w-5" />
              <h2 className="font-bold text-white">{t('lab.sequence_title')}</h2>
            </div>
            <ol className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="font-mono text-emerald-300">01</span> {t('lab.seq_1')}
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-emerald-300">02</span> {t('lab.seq_2')}
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-emerald-300">03</span> {t('lab.seq_3')}
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
};
