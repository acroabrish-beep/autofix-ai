import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useLearning } from '../hooks/useLearning';
import { CategoryFilter } from '../components/learning/CategoryFilter';
import { LearningCard } from '../components/learning/LearningCard';
import { LearningSkeleton } from '../components/learning/LearningSkeleton';
import { LearningEmptyState } from '../components/learning/LearningEmptyState';
import { ErrorState } from '../components/ui/Error';

export const Learning = () => {
  const { t } = useTranslation();
  const { modules, loading, error } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter is no longer available since category field was removed
      const matchesCategory = activeCategory === 'All';

      return matchesSearch && matchesCategory;
    });
  }, [modules, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
           <h1 className="text-4xl font-extrabold text-brand-navy mb-4">{t('learning.title')}</h1>
           <p className="text-slate-600 max-w-2xl text-lg">
             {t('learning.subtitle')}
           </p>
        </header>

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('learning.search_placeholder')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm lg:hidden">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-semibold">{t('learning.filters')}</span>
           </button>
        </div>

        <CategoryFilter
           activeCategory={activeCategory}
           onCategoryChange={setActiveCategory}
        />

        {loading ? (
          <LearningSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModules.map((module) => (
              <LearningCard key={module.$id} module={module} />
            ))}
          </div>
        ) : (
          <LearningEmptyState
            title={searchQuery ? t('learning.no_results_title') : t('learning.no_modules_title')}
            message={
              searchQuery
                ? t('learning.no_results_message', { query: searchQuery })
                : t('learning.no_modules_message')
            }
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
            actionText={searchQuery ? t('learning.clear_search') : undefined}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
