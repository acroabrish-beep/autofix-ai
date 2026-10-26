import React from 'react';
import { useTranslation } from 'react-i18next';

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { number: '01', title: t('extras.how_learn'), description: t('extras.how_learn_desc') },
    { number: '02', title: t('extras.how_diagnose'), description: t('extras.how_diagnose_desc') },
    { number: '03', title: t('extras.how_repair'), description: t('extras.how_repair_desc') },
    { number: '04', title: t('extras.how_empower'), description: t('extras.how_empower_desc') },
  ];

  return (
    <section id="learning" className="py-24 bg-brand-navy text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-16 text-center lg:text-left">
          {t('extras.how_title')}
        </h2>

        <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-0">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-px bg-slate-700 z-0"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex-1 lg:pr-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="bg-brand-teal text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-8 border-[6px] border-brand-navy shadow-xl">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-widest">{step.title}</h3>
                <p className="text-slate-400 text-center lg:text-left leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
