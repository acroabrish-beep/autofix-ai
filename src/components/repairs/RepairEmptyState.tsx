import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench, Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface RepairEmptyStateProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionText?: string;
  isSearch?: boolean;
}

export const RepairEmptyState: React.FC<RepairEmptyStateProps> = ({
  title,
  message,
  onAction,
  actionText,
  isSearch = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
        {isSearch ? (
          <Search className="h-8 w-8 text-slate-300" />
        ) : (
          <Wrench className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <h3 className="text-xl font-bold text-brand-navy mb-2">
        {title ?? t('repairs.empty_title')}
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">
        {message ?? t('repairs.cant_find_desc')}
      </p>
      {onAction && actionText && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};
