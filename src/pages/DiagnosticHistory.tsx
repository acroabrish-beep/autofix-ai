import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useDiagnostics } from '../hooks/useDiagnostics';
import { DiagnosticResult } from '../components/diagnostics/DiagnosticResult';
import { Loading } from '../components/ui/Loading';
import {
  History,
  ChevronRight,
  ArrowLeft,
  Search,
  Activity,
  Calendar,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DiagnosticSession } from '../types';

export const DiagnosticHistory = () => {
  const { t } = useTranslation();
  const { sessions, loading } = useDiagnostics();
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredSessions = sessions.filter(s =>
    s.userInput.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && sessions.length === 0) return <Loading message={t('history.loading')} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedSession ? (
          <div>
            <button
               onClick={() => setSelectedSession(null)}
               className="flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors mb-8 font-bold"
            >
               <ArrowLeft className="w-4 h-4" /> {t('history.back')}
            </button>
            <DiagnosticResult response={selectedSession.result} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-3">
                   <History className="w-8 h-8 text-brand-blue" /> {t('history.title')}
                </h1>
                <p className="text-slate-500 mt-2">{t('history.subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/diagnostics')}
                className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg flex items-center gap-2"
              >
                <Activity className="w-5 h-5" /> {t('history.new_analysis')}
              </button>
            </header>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('history.search_placeholder')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div
                    key={session.$id}
                    onClick={() => setSelectedSession(session)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-brand-teal hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-6"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors">
                       <Wrench className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Calendar className="w-3 h-3" /> {new Date(session.$createdAt).toLocaleDateString()}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                          {t(`history.status_${session.status}`, { defaultValue: session.status })}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{session.userInput}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{t('history.confidence')}</div>
                          <div className="text-sm font-bold text-brand-navy">{Math.round(session.result.confidence * 100)}%</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('history.empty_title')}</h3>
                <p className="text-slate-500 mb-8">{t('history.empty_desc')}</p>
                <button
                  onClick={() => navigate('/diagnostics')}
                  className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90"
                >
                  {t('history.start_new')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
