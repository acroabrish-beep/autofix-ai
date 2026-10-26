import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Gauge, Globe, Smartphone } from 'lucide-react';

export const Trust = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-brand-teal" />,
      title: t('extras.trust_ai_title'),
      description: t('extras.trust_ai_desc'),
    },
    {
      icon: <Gauge className="h-6 w-6 text-brand-teal" />,
      title: t('extras.trust_practical_title'),
      description: t('extras.trust_practical_desc'),
    },
    {
      icon: <Globe className="h-6 w-6 text-brand-teal" />,
      title: t('extras.trust_multilingual_title'),
      description: t('extras.trust_multilingual_desc'),
    },
    {
      icon: <Smartphone className="h-6 w-6 text-brand-teal" />,
      title: t('extras.trust_accessible_title'),
      description: t('extras.trust_accessible_desc'),
    },
  ];

  return (
    <section id="about" className="py-12 bg-slate-50 border-y">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-slate-500 font-semibold uppercase tracking-widest text-sm mb-12">
          {t('extras.trust_title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 bg-brand-teal/10 rounded-xl">
                {feature.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
