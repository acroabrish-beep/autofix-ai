import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

export const TVET = () => {
  const { t } = useTranslation();

  const highlights = [
    t('extras.tvet_highlight_1'),
    t('extras.tvet_highlight_2'),
    t('extras.tvet_highlight_3'),
    t('extras.tvet_highlight_4'),
    t('extras.tvet_highlight_5'),
  ];

  return (
    <section id="tvet" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold text-brand-navy mb-6 leading-tight">
              {t('extras.tvet_title_1')} <br />
              {t('extras.tvet_title_2')}
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {t('extras.tvet_desc')}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="text-brand-teal h-5 w-5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Button size="lg" variant="secondary" className="px-10">
              {t('extras.tvet_button')}
            </Button>
          </div>

          <div className="lg:w-1/2 relative">
             <div className="bg-slate-100 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden group">
                {/* Visual placeholder for TVET Lab */}
                <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-slate-500 font-medium">{t('extras.tvet_preview')}</span>
                </div>

                {/* Floating UI elements */}
                <div className="absolute top-8 right-8 bg-white p-3 rounded-lg shadow-lg border border-slate-200 flex items-center gap-3 animate-bounce">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">100</div>
                    <span className="text-xs font-semibold">{t('extras.tvet_unlocked')}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
