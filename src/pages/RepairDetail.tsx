import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Clock,
  Info,
  AlertTriangle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { ErrorState } from '../components/ui/Error';
import { useRepairGuides } from '../hooks/useRepairGuides';
import { localizeRepairGuide } from '../lib/localizeContent';

export const RepairDetail = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentGuide: guide, loading, error } = useRepairGuides(guideId);

  const localizedGuide = useMemo(
    () => (guide ? localizeRepairGuide(guide, t) : null),
    [guide, t]
  );

  if (loading) return <Loading message={t('repairs.loading')} />;
  if (error || !localizedGuide) return <ErrorState message={error || t('repairs.not_found')} onRetry={() => navigate('/repairs')} />;

  // `steps` is an optional array attribute; a missing value would crash .map().
  const steps = localizedGuide.steps || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pb-24">
        {/* Header Section */}
        <div className="bg-brand-navy text-white pt-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/repairs')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> {t('repairs.back')}
            </button>

            <div className="max-w-4xl">
               <div className="flex items-center gap-3 mb-6">
                  <Badge className="bg-brand-teal text-brand-navy font-bold">{localizedGuide.category}</Badge>
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{localizedGuide.difficulty}</span>
               </div>
               <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">{localizedGuide.title}</h1>
               <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                  {localizedGuide.description}
               </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content: Steps */}
            <div className="lg:col-span-2 space-y-12">
               {/* Safety Notice First */}
               <section className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-r-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4 text-amber-800">
                     <ShieldAlert className="w-6 h-6" />
                     <h3 className="text-xl font-bold uppercase tracking-wide">{t('repairs.safety_first')}</h3>
                  </div>
                  <p className="text-amber-700 leading-relaxed font-medium mb-6">
                     {t('repairs.safety_intro')}
                  </p>
                  <ul className="space-y-3">
                     {(localizedGuide.safetyNotes || t('repairs.safety_default')).split('.').filter(n => n.trim()).map((note, i) => (
                       <li key={i} className="flex items-start gap-2 text-amber-900 text-sm">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {note.trim()}.
                       </li>
                     ))}
                  </ul>
               </section>

               {/* Procedure */}
               <section className="bg-white rounded-3xl border shadow-xl p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-brand-navy mb-10 flex items-center gap-3">
                     <BookOpen className="w-6 h-6 text-brand-blue" /> {t('repairs.procedure')}
                  </h2>

                  <div className="space-y-10">
                     {steps.map((step, idx) => (
                       <div key={idx} className="relative pl-16 group">
                          <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all border border-slate-100 group-hover:border-brand-blue shadow-sm">
                             {idx + 1}
                          </div>
                          {idx < steps.length - 1 && (
                            <div className="absolute left-5 top-12 bottom-[-40px] w-0.5 bg-slate-100 group-hover:bg-brand-blue/20"></div>
                          )}
                          <div className="pt-2">
                             <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                {step}
                             </p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="mt-20 p-6 bg-slate-50 rounded-2xl border flex items-center justify-between">
                     <div className="flex items-center gap-3 text-brand-navy font-bold">
                        <CheckCircle2 className="w-6 h-6 text-brand-teal" />
                        {t('repairs.finalized')}
                     </div>
                     <Button variant="ghost" className="text-brand-blue" onClick={() => navigate('/diagnostics')}>
                        {t('repairs.verify')} <ChevronRight className="ml-1 w-4 h-4" />
                     </Button>
                  </div>
               </section>
            </div>

            {/* Sidebar: Tools & Metadata */}
            <div className="space-y-8">
               <div className="bg-white rounded-3xl border shadow-lg p-8">
                  <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <Wrench className="w-5 h-5 text-brand-blue" /> {t('repairs.required_tools')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {localizedGuide.requiredTools?.length ? localizedGuide.requiredTools.map(tool => (
                       <span key={tool} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">
                          {tool}
                       </span>
                     )) : (
                       <span className="text-sm text-slate-400">{t('repairs.standard_toolkit')}</span>
                     )}
                  </div>
               </div>

               <div className="bg-brand-blue rounded-3xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-6 opacity-60">
                     <Info className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest">{t('repairs.metadata')}</span>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                        <span className="text-white/60">{t('repairs.estimated_time')}</span>
                        <span className="font-bold flex items-center gap-1"><Clock className="w-4 h-4" /> {t('repairs.time_value', { count: localizedGuide.estimatedMinutes || 45 })}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                        <span className="text-white/60">{t('repairs.system_type')}</span>
                        <span className="font-bold">{localizedGuide.category}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">{t('repairs.verified_date')}</span>
                        <span className="font-bold">{t('repairs.verified_value')}</span>
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-white rounded-3xl border shadow-sm text-center">
                  <h4 className="font-bold text-slate-900 mb-2">{t('repairs.need_help')}</h4>
                  <p className="text-slate-500 text-sm mb-6">{t('repairs.need_help_desc')}</p>
                  <Button className="w-full bg-brand-teal text-brand-navy hover:bg-brand-teal/90">
                     {t('repairs.start_lab')}
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
