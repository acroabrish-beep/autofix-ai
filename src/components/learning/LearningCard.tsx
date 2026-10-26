import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, BarChart, ChevronRight } from 'lucide-react';
import { LearningModule } from '../../types';
import { Badge } from '../ui/Badge';
import { LearningProgress } from './LearningProgress';
import { localizeLearningCategory, localizeLevel, localizeLearningModule } from '../../lib/localizeContent';

interface LearningCardProps {
  module: LearningModule;
  progressPercent?: number;
}

export const LearningCard: React.FC<LearningCardProps> = ({ module, progressPercent = 0 }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const localizedModule = useMemo(
    () => localizeLearningModule(module, t),
    [module, t]
  );

  return (
    <div
      className="group bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-teal flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/learning/${module.$id}`)}
    >
      <div className="relative w-full h-48 bg-slate-100 rounded-2xl mb-6 overflow-hidden">
        {module.thumbnail ? (
          <img src={module.thumbnail} alt={localizedModule.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             <BarChart className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 left-4">
           <Badge variant="secondary" className="shadow-sm">{localizeLearningCategory(localizedModule.category, t)}</Badge>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{' '}
            {localizedModule.duration || (localizedModule.estimatedMinutes ? t('learning.mins', { count: localizedModule.estimatedMinutes }) : '—')}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{localizeLevel(localizedModule.level, t)}</span>
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-blue transition-colors">
          {localizedModule.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
          {localizedModule.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50">
        {progressPercent > 0 ? (
          <LearningProgress percentage={progressPercent} />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-brand-blue group-hover:underline flex items-center">
              {t('learning.start_module')} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
