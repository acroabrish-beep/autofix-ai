import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DiagnosticForm } from '../components/diagnostics/DiagnosticForm';
import { DiagnosticResult } from '../components/diagnostics/DiagnosticResult';
import { DiagnosticLoading } from '../components/diagnostics/DiagnosticLoading';
import { SafetyNotice } from '../components/diagnostics/SafetyNotice';
import { ErrorState } from '../components/ui/Error';
import { useDiagnostics } from '../hooks/useDiagnostics';
import { Brain, History, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Diagnostics = () => {
  const { analyzeSymptoms, currentSession, loading, error, setCurrentSession } = useDiagnostics();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-brand-blue mb-4">
              <div className="bg-brand-blue/10 p-2 rounded-xl">
                 <Brain className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-brand-navy">{t('diagnostics.title')}</h1>
            </div>
            <p className="text-slate-600 max-w-xl">
              {t('diagnostics.subtitle')}
            </p>
          </div>
          <div className="flex gap-4">
             <button
                onClick={() => navigate('/diagnostics/history')}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm"
             >
                <History className="w-5 h-5" /> {t('diagnostics.view_history')}
             </button>
             {currentSession && (
               <button
                  onClick={() => setCurrentSession(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg"
               >
                  <Plus className="w-5 h-5" /> {t('diagnostics.new_analysis')}
               </button>
             )}
          </div>
        </header>

        {loading ? (
          <DiagnosticLoading />
        ) : error ? (
          <div className="max-w-2xl mx-auto py-12">
             <ErrorState
                title={t('diagnostics.analysis_failed')}
                message={error}
                onRetry={() => window.location.reload()}
             />
          </div>
        ) : currentSession ? (
          <DiagnosticResult response={currentSession.result} />
        ) : (
          <div className="max-w-4xl mx-auto">
             <DiagnosticForm onSubmit={analyzeSymptoms} loading={loading} />
             <div className="mt-12">
                <SafetyNotice />
             </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
