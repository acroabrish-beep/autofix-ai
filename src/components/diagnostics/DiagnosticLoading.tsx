import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Brain, Database, Search } from 'lucide-react';

export const DiagnosticLoading: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-4 border-brand-teal/20 rounded-full animate-spin border-t-brand-teal"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-10 h-10 text-brand-blue animate-pulse" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-brand-navy mb-4 animate-bounce">
        {t('diagnostics_result.loading_title')}
      </h3>

      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center gap-4 text-left p-4 bg-slate-50 rounded-2xl border">
          <Activity className="w-5 h-5 text-brand-teal" />
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              {t('diagnostics_result.step', { number: 1 })}
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {t('diagnostics_result.step1')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-left p-4 bg-slate-50 rounded-2xl border opacity-60">
          <Search className="w-5 h-5 text-brand-blue" />
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              {t('diagnostics_result.step', { number: 2 })}
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {t('diagnostics_result.step2')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-left p-4 bg-slate-50 rounded-2xl border opacity-30">
          <Database className="w-5 h-5 text-brand-navy" />
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              {t('diagnostics_result.step', { number: 3 })}
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {t('diagnostics_result.step3')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
