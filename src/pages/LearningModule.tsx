import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Info,
  ChevronRight,
  Play,
  Wrench
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { ErrorState } from '../components/ui/Error';
import { LearningProgress } from '../components/learning/LearningProgress';
import { useLearning } from '../hooks/useLearning';

import { RepairGuide } from '../types';
import { repairGuidesService } from '../services/database/repairGuides';
import {
  localizeLearningCategory,
  localizeLevel,
  localizeRepairGuide,
  localizeLearningModule
} from '../lib/localizeContent';

export const LearningModule = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentModule: module, progress, loading, error, updateProgress } = useLearning(moduleId);
  const [relatedGuides, setRelatedGuides] = useState<RepairGuide[]>([]);
   const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      if (module) {
        try {
          const guides = await repairGuidesService.listGuides(module.category);
          setRelatedGuides(guides.slice(0, 2));
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchRelated();
  }, [module]);

  const localizedGuides = useMemo(
    () => relatedGuides.map((guide) => localizeRepairGuide(guide, t)),
    [relatedGuides, t]
  );

  const localizedModule = useMemo(
    () => module ? localizeLearningModule(module, t) : null,
    [module, t]
  );

  const handleStart = async () => {
      setStarted(true);
      document.getElementById('course-material')?.scrollIntoView({
         behavior: 'smooth',
         block: 'start',
      });

    if (progress?.progressPercent === 0 || !progress) {
         await updateProgress(10);
    }
  };

  const handleComplete = async () => {
    await updateProgress(100);
  };

  if (loading) return <Loading message={t('learning.loading_module')} />;
  if (error || !localizedModule) return <ErrorState message={error || t('learning.module_not_found')} onRetry={() => navigate('/learning')} />;

  const isCompleted = progress?.completed || false;
   const progressPercent = Math.max(progress?.progressPercent || 0, started ? 10 : 0);
   const hasStarted = started || progressPercent > 0;
   const localizedCategory = localizeLearningCategory(localizedModule.category, t);
   const contentParagraphs = localizedModule.content?.trim()
      ? localizedModule.content.trim().split(/\n\s*\n/).filter(Boolean)
      : [
            t('learning.fallback_p1', { title: localizedModule.title, category: localizedCategory }),
            t('learning.fallback_p2'),
            t('learning.fallback_p3'),
         ];
   const keyConcepts = [
      t('learning.concept_main', { category: localizedCategory.toLowerCase() }),
      t('learning.concept_confirm'),
      t('learning.concept_compare'),
   ];
   const keyTakeaways = [
      t('learning.takeaway_workflow'),
      t('learning.takeaway_document'),
      t('learning.takeaway_safety'),
   ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pb-24">
        {/* Module Header */}
        <div className="bg-brand-navy text-white pt-12 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/learning')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> {t('learning.back_to_academy')}
            </button>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="bg-brand-teal/20 text-brand-teal border-brand-teal/30">
                    {localizedCategory}
                  </Badge>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-400 text-sm uppercase tracking-widest font-bold">{localizeLevel(localizedModule.level, t)}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">{localizedModule.title}</h1>
                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                  {localizedModule.description}
                </p>

                <div className="flex flex-wrap gap-8 items-center">
                   <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-brand-teal" />
                      <span className="font-semibold">
                        {localizedModule.duration || (localizedModule.estimatedMinutes ? t('learning.minutes', { count: localizedModule.estimatedMinutes }) : t('learning.self_paced'))}
                      </span>
                   </div>
                   <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-teal" />
                      <span className="font-semibold">{t('learning.professional_module')}</span>
                   </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
                 <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold">{t('learning.your_progress')}</h3>
                       <span className="text-brand-teal font-bold">{progressPercent}%</span>
                    </div>
                    <LearningProgress percentage={progressPercent} showText={false} />
                              {hasStarted && (
                                 <p className="mt-3 text-sm font-semibold text-emerald-300">{t('learning.started')}</p>
                              )}
                 </div>

                 {!isCompleted ? (
                   <Button size="lg" className="w-full py-8 text-lg gap-2" onClick={handleStart}>
                      {progressPercent > 0 ? t('learning.continue_learning') : t('learning.start_learning')} <Play className="w-5 h-5 fill-current" />
                   </Button>
                 ) : (
                   <div className="flex items-center justify-center gap-3 py-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">{t('learning.module_completed')}</span>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border p-8 lg:p-12">
               <article className="prose prose-slate max-w-none">
                           <div className="space-y-10">
                              <section id="course-material" className="scroll-mt-8">
                                 <div className="flex items-center gap-3 mb-5">
                                    <Info className="w-6 h-6 text-brand-blue" />
                                 <h2 className="text-2xl font-bold text-brand-navy">{t('learning.course_material')}</h2>
                                 </div>
                                 <div className="space-y-5">
                                    {contentParagraphs.map((paragraph, index) => (
                                       <p key={index} className="text-slate-600 leading-relaxed text-lg">
                                          {paragraph}
                                       </p>
                                    ))}
                                 </div>
                              </section>

                              <section className="bg-slate-50 rounded-2xl p-6 border-l-4 border-brand-teal">
                                 <h3 className="text-xl font-bold text-brand-blue mb-4">{t('learning.workshop_checklist')}</h3>
                                 <ul className="space-y-3">
                                    {keyConcepts.map((item) => (
                                       <li key={item} className="flex items-start gap-3 text-slate-700 font-medium">
                                          <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                                          <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </section>

                              <section className="rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.03] p-6">
                                 <h3 className="text-xl font-bold text-brand-navy mb-4">{t('learning.key_takeaways')}</h3>
                                 <ul className="list-disc pl-5 space-y-2 text-slate-600 leading-relaxed">
                                    {keyTakeaways.map((item) => <li key={item}>{item}</li>)}
                                 </ul>
                              </section>
                           </div>
               </article>

                  <div className="mt-16 pt-8 border-t flex justify-between items-center">
                     <Button variant="ghost" onClick={() => navigate('/learning')}>
                        {t('learning.explore_other')}
                     </Button>
                     {!isCompleted && (
                       <Button variant="secondary" onClick={handleComplete}>
                          {t('learning.mark_complete')}
                       </Button>
                     )}
                  </div>

                  {/* Integrated Repair Suggestions */}
                  {localizedGuides.length > 0 && (
                    <div className="mt-16 p-8 bg-slate-900 rounded-[32px] text-white overflow-hidden relative group">
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                          <Wrench className="w-24 h-24 text-brand-teal" />
                       </div>
                       <div className="relative z-10">
                          <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                             {t('learning.ready_title')}
                          </h3>
                          <p className="text-slate-400 text-sm mb-8 max-w-lg">{t('learning.ready_desc')}</p>
                          <div className="grid sm:grid-cols-2 gap-4">
                             {localizedGuides.map(guide => (
                               <div key={guide.$id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate(`/repairs/${guide.$id}`)}>
                                  <div className="text-[10px] font-bold text-brand-teal uppercase mb-2 tracking-tighter">{guide.difficulty} • {t('learning.mins', { count: guide.estimatedMinutes || 30 })}</div>
                                  <h4 className="font-bold text-white text-sm mb-3">{guide.title}</h4>
                                  <div className="flex items-center text-xs font-black text-white/40 uppercase group-hover:text-brand-teal transition-colors">
                                     {t('learning.view_procedure')} <ChevronRight className="w-3 h-3 ml-1" />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
               <div className="bg-slate-50 rounded-3xl p-6 border">
                  <h4 className="font-bold text-slate-900 mb-6">{t('learning.module_roadmap')}</h4>
                  <div className="space-y-6 relative">
                     <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                     {[
                       { title: t('learning.roadmap_fundamentals'), status: 'completed' as const },
                       { title: t('learning.roadmap_diagnostics'), status: 'current' as const },
                       { title: t('learning.roadmap_workshop'), status: 'locked' as const },
                       { title: t('learning.roadmap_quiz'), status: 'locked' as const },
                     ].map((step, i) => (
                       <div key={i} className="relative flex items-center gap-4 pl-10">
                          <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                            step.status === 'completed' ? 'bg-brand-teal text-white' :
                            step.status === 'current' ? 'bg-brand-blue text-white' : 'bg-slate-200'
                          }`}>
                             {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i+1}</span>}
                          </div>
                          <div>
                             <div className={`text-sm font-bold ${step.status === 'locked' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</div>
                             <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{t(`learning.status_${step.status}`)}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-brand-blue rounded-3xl p-8 text-white">
                  <h4 className="font-bold mb-4">{t('learning.practical_lab')}</h4>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                     {t('learning.practical_lab_desc')}
                  </p>
                  <Button asChild className="w-full bg-white text-brand-blue hover:bg-white/90">
                     <Link to={`/lab/${localizedModule.$id}`}>{t('learning.enter_lab')}</Link>
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
