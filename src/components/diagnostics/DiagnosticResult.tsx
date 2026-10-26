import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DiagnosticResponse, RepairGuide } from '../../types';
import { Badge } from '../ui/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Zap,
  BookOpen,
  Loader2
} from 'lucide-react';
import { SafetyNotice } from './SafetyNotice';
import { repairGuidesService } from '../../services/database/repairGuides';
import { learningService } from '../../services/database/learning';
import { findRelevantGuide } from '../../lib/repairMatcher';

interface DiagnosticResultProps {
  response: DiagnosticResponse;
}

export const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ response }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [matchingGuide, setMatchingGuide] = useState<RepairGuide | null>(null);
  const [matchingModule, setMatchingModule] = useState<any | null>(null);
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    const findRelatedContent = async () => {
      try {
        const [allGuides, allModules] = await Promise.all([
          repairGuidesService.listGuides(),
          learningService.listModules()
        ]);

        const primaryCause = response.possibleCauses[0];
        if (primaryCause) {
          const matchGuide = findRelevantGuide(primaryCause, allGuides);
          setMatchingGuide(matchGuide);

          // Simple module matching by category or keyword
          const matchModule = allModules.find(m =>
            m.title.toLowerCase().includes(primaryCause.title.toLowerCase()) ||
            primaryCause.description.toLowerCase().includes(m.category.toLowerCase())
          );
          setMatchingModule(matchModule);
        }
      } catch (err) {
        console.error('Content matching error:', err);
      } finally {
        setSearching(false);
      }
    };
    findRelatedContent();
  }, [response]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Card */}
      <div className="bg-brand-navy text-white p-8 lg:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Zap className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Badge className="bg-brand-teal text-brand-navy font-bold px-4 py-1">{t('diagnostics_result.analysis_complete')}</Badge>
            <span className="text-slate-400 font-mono text-sm">{t('diagnostics_result.confidence', { value: Math.round(response.confidence * 100) })}</span>
          </div>
          <h2 className="text-3xl font-bold mb-6">{t('diagnostics_result.summary')}</h2>
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
            {response.summary}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Possible Causes */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border p-8 shadow-sm">
            <h3 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" /> {t('diagnostics_result.likely_causes')}
            </h3>
            <div className="space-y-6">
              {response.possibleCauses.map((cause, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group transition-all hover:border-brand-teal/30">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-lg">{cause.title}</h4>
                    <span className="text-xs font-bold text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-full">
                       {t('diagnostics_result.match', { value: Math.round(cause.probability * 100) })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{cause.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border p-8 shadow-sm">
            <h3 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-3">
              <Wrench className="w-6 h-6 text-brand-teal" /> {t('diagnostics_result.recommended_checks')}
            </h3>
            <div className="space-y-4">
              {response.recommendedChecks.map((check, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-brand-teal text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{check.title}</h4>
                    <p className="text-slate-600 text-sm mb-3">{check.description}</p>
                    {check.toolsRequired && check.toolsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {check.toolsRequired.map(tool => (
                          <span key={tool} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter border px-2 py-0.5 rounded">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <section className="bg-brand-blue text-white rounded-3xl p-8 shadow-lg">
              <h3 className="font-bold mb-6">{t('diagnostics_result.next_steps')}</h3>
              <div className="space-y-4 mb-8">
                 {response.nextSteps.map((step, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-white/90">{step}</span>
                   </div>
                 ))}
              </div>

              {searching ? (
                <div className="flex items-center justify-center py-4 bg-white/10 rounded-xl">
                   <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                   {matchingGuide ? (
                      <button
                         onClick={() => navigate(`/repairs/${matchingGuide.$id}`)}
                         className="w-full py-4 bg-white text-brand-blue rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-md group"
                      >
                         <BookOpen className="w-4 h-4" /> {t('diagnostics_result.open_guide')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   ) : (
                      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                         <p className="text-xs text-white/60 mb-2">{t('diagnostics_result.guide_unavailable')}</p>
                         <button onClick={() => navigate('/repairs')} className="text-xs font-bold text-brand-teal hover:underline">
                            {t('diagnostics_result.browse_library')}
                         </button>
                      </div>
                   )}

                   {matchingModule ? (
                      <button
                         onClick={() => navigate(`/learning/${matchingModule.$id}`)}
                         className="w-full py-4 bg-brand-teal text-brand-navy rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-teal/90 transition-all shadow-md"
                      >
                         <ShieldAlert className="w-4 h-4" /> {t('diagnostics_result.learn_system')}
                      </button>
                   ) : (
                      <div className="text-center p-3 text-[10px] text-white/40 uppercase tracking-widest border border-white/5 rounded-xl">
                         {t('diagnostics_result.module_soon')}
                      </div>
                   )}
                </div>
              )}
           </section>

           <div className="bg-white rounded-3xl border p-8">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-amber-500" /> {t('diagnostics_result.safety_notes')}
              </h3>
              <ul className="space-y-3">
                 {response.safetyNotes.map((note, idx) => (
                   <li key={idx} className="text-xs text-slate-500 leading-relaxed list-disc ml-4">
                      {note}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>

      <SafetyNotice />

      <div className="text-center py-12">
         <p className="text-slate-400 text-sm max-w-2xl mx-auto italic">
            {response.disclaimer}
         </p>
      </div>
    </div>
  );
};
