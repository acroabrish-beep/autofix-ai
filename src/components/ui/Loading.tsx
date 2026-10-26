import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-2" />
      <p className="text-slate-500 text-sm font-medium">{message ?? t('shared.loading')}</p>
    </div>
  );
};
