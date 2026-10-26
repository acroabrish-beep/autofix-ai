import React from 'react';
import { useTranslation } from 'react-i18next';

interface LearningProgressProps {
  percentage: number;
  className?: string;
  showText?: boolean;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  percentage,
  className = "",
  showText = true
}) => {
  const { t } = useTranslation();
  const normalized = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {showText && <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t('learning.progress')}</span>}
        {showText && <span className="text-xs font-bold text-brand-blue">{normalized}%</span>}
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-teal transition-all duration-500 ease-out"
          style={{ width: `${normalized}%` }}
        ></div>
      </div>
    </div>
  );
};
