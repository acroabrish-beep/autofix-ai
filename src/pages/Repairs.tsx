import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Wrench, SlidersHorizontal, BookOpen } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useRepairGuides } from '../hooks/useRepairGuides';
import { RepairCard } from '../components/repairs/RepairCard';
import { RepairSkeleton } from '../components/repairs/RepairSkeleton';
import { RepairEmptyState } from '../components/repairs/RepairEmptyState';
import { MOCK_REPAIR_GUIDES } from '../data/mockRepairGuides';
import { localizeRepairCategory, localizeRepairGuide } from '../lib/localizeContent';

const REPAIR_CATEGORIES = [
  'All',
  'Electrical Systems',
  'Engine Systems',
  'Braking System',
  'Suspension & Steering',
  'Drivetrain',
  'Diagnostics'
];

export const Repairs = () => {
  const { t } = useTranslation();
  const { guides, loading, error } = useRepairGuides();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const guideSource = guides.length > 0 ? guides : MOCK_REPAIR_GUIDES;

  const filteredGuides = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return guideSource
      .map((guide) => ({ original: guide, localized: localizeRepairGuide(guide, t) }))
      .filter(({ original, localized }) => {
        const matchesSearch = [
          original.title,
          original.description,
          localized.title,
          localized.description,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

        const matchesCategory =
          activeCategory === 'All' || original.category === activeCategory;

        return matchesSearch && matchesCategory;
      })
      .map(({ localized }) => localized);
  }, [guideSource, searchQuery, activeCategory, t]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
           <div className="flex items-center gap-3 text-brand-blue mb-4">
              <Wrench className="w-8 h-8" />
              <h1 className="text-4xl font-extrabold text-brand-navy">{t('repairs.title')}</h1>
           </div>
           <p className="text-slate-600 max-w-2xl text-lg">
             {t('repairs.subtitle')}
           </p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('repairs.search_placeholder')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
              {REPAIR_CATEGORIES.map((cat) => {
                const label =
                  cat === 'All' ? t('repairs.all') : localizeRepairCategory(cat, t);

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm ${
                      activeCategory === cat
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-slate-600 border border-slate-100 hover:border-brand-blue/30'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
           </div>
        </div>

        {!loading && guideSource === MOCK_REPAIR_GUIDES && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('repairs.sample_notice')}
          </p>
        )}

        {loading ? (
          <RepairSkeleton />
        ) : filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => (
              <RepairCard key={guide.$id} guide={guide} />
            ))}
          </div>
        ) : (
          <RepairEmptyState
            isSearch={!!searchQuery}
            title={searchQuery ? t('repairs.no_match_title') : t('repairs.empty_title')}
            message={
              searchQuery
                ? t('repairs.no_match_message', { query: searchQuery })
                : undefined
            }
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
            actionText={searchQuery ? t('repairs.clear_search') : t('repairs.refresh')}
          />
        )}

        {/* Pro Tip Section */}
        <section className="mt-20 p-8 bg-brand-navy rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
              <BookOpen className="w-8 h-8 text-brand-teal" />
           </div>
           <div>
              <h3 className="text-xl font-bold mb-2">{t('repairs.cant_find_title')}</h3>
              <p className="text-white/60 text-sm max-w-xl">
                 {t('repairs.cant_find_desc')}
              </p>
           </div>
           <button className="md:ml-auto px-8 py-4 bg-brand-teal text-brand-navy rounded-xl font-bold hover:bg-brand-teal/90 transition-colors whitespace-nowrap">
              {t('repairs.request')}
           </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
