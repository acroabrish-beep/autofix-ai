import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorProps> = ({ title, message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title ?? t('shared.error')}</h3>
      <p className="text-slate-600 text-sm mb-6 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> {t('shared.retry')}
        </Button>
      )}
    </div>
  );
};
