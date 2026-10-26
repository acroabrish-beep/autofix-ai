import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, BookOpen, Wrench, Car, Activity, Loader2, X } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { searchService, GlobalSearchResults } from '../services/database/search';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { localizeLearningCategory, localizeRepairCategory } from '../lib/localizeContent';

export const Search = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch();
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchService.globalSearch(query, user?.$id);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = results &&
    results.academy.length === 0 &&
    results.repairs.length === 0 &&
    results.garage.length === 0 &&
    results.diagnostics.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-brand-navy mb-4">{t('search.title')}</h1>
            <p className="text-slate-600">{t('search.subtitle')}</p>
          </header>

          <div className="relative mb-16">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
               {loading ? <Loader2 className="w-6 h-6 animate-spin text-brand-blue" /> : <SearchIcon className="w-6 h-6" />}
            </div>
            <input
              type="text"
              autoFocus
              placeholder={t('search.placeholder')}
              className="w-full pl-16 pr-16 py-6 rounded-3xl bg-white border-2 border-slate-100 shadow-xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none text-xl transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {results ? (
            <div className="space-y-12">
               {/* Academy Results */}
               {results.academy.length > 0 && (
                 <section>
                    <div className="flex items-center gap-2 mb-6 text-brand-blue">
                       <BookOpen className="w-5 h-5" />
                       <h2 className="font-bold uppercase tracking-widest text-sm">{t('search.educational')}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                       {results.academy.map(m => (
                         <div key={m.$id} className="bg-white p-6 rounded-2xl border hover:border-brand-teal transition-all cursor-pointer" onClick={() => navigate(`/learning/${m.$id}`)}>
                            <Badge variant="outline" className="mb-3">{localizeLearningCategory(m.category, t)}</Badge>
                            <h3 className="font-bold text-slate-900 mb-1">{m.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>
                         </div>
                       ))}
                    </div>
                 </section>
               )}

               {/* Repair Results */}
               {results.repairs.length > 0 && (
                 <section>
                    <div className="flex items-center gap-2 mb-6 text-brand-blue">
                       <Wrench className="w-5 h-5" />
                       <h2 className="font-bold uppercase tracking-widest text-sm">{t('search.procedures')}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                       {results.repairs.map(r => (
                         <div key={r.$id} className="bg-white p-6 rounded-2xl border hover:border-brand-teal transition-all cursor-pointer" onClick={() => navigate(`/repairs/${r.$id}`)}>
                            <Badge variant="outline" className="mb-3">{localizeRepairCategory(r.category, t)}</Badge>
                            <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
                         </div>
                       ))}
                    </div>
                 </section>
               )}

               {/* My Garage */}
               {results.garage.length > 0 && (
                 <section>
                    <div className="flex items-center gap-2 mb-6 text-brand-blue">
                       <Car className="w-5 h-5" />
                       <h2 className="font-bold uppercase tracking-widest text-sm">{t('search.garage')}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                       {results.garage.map(v => (
                         <div key={v.$id} className="bg-white p-6 rounded-2xl border hover:border-brand-teal transition-all cursor-pointer" onClick={() => navigate(`/vehicles/${v.$id}`)}>
                            <h3 className="font-bold text-slate-900 mb-1">{v.make} {v.model}</h3>
                            <p className="text-xs text-slate-500">{v.year} • {v.engine}</p>
                         </div>
                       ))}
                    </div>
                 </section>
               )}

               {/* Diagnostics */}
               {results.diagnostics.length > 0 && (
                 <section>
                    <div className="flex items-center gap-2 mb-6 text-brand-blue">
                       <Activity className="w-5 h-5" />
                       <h2 className="font-bold uppercase tracking-widest text-sm">{t('search.diagnostics')}</h2>
                    </div>
                    <div className="space-y-3">
                       {results.diagnostics.map(s => (
                         <div key={s.$id} className="bg-white p-4 rounded-2xl border hover:border-brand-teal transition-all cursor-pointer flex justify-between items-center" onClick={() => navigate('/diagnostics/history')}>
                            <div>
                               <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{s.userInput}</h3>
                               <p className="text-[10px] text-slate-400">{new Date(s.$createdAt).toLocaleDateString()}</p>
                            </div>
                            <Badge className="bg-brand-blue/5 text-brand-blue border-none text-[10px]">{t('search.confidence', { value: Math.round(s.result.confidence * 100) })}</Badge>
                         </div>
                       ))}
                    </div>
                 </section>
               )}

               {isEmpty && (
                 <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                    <X className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">{t('search.no_matches')}</h3>
                    <p className="text-slate-500">{t('search.no_matches_query', { query })}</p>
                 </div>
               )}
            </div>
          ) : query.length > 0 && query.length <= 2 ? (
            <div className="text-center py-20 text-slate-400">
               {t('search.min_chars')}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-40 grayscale pointer-events-none">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-32 bg-white rounded-3xl border-2 border-dashed border-slate-200"></div>
               ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
