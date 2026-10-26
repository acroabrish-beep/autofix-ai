import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wrench, ChevronRight, Clock, ShieldAlert } from 'lucide-react';
import { RepairGuide } from '../../types';
import { Badge } from '../ui/Badge';

interface RepairCardProps {
  guide: RepairGuide;
}

export const RepairCard: React.FC<RepairCardProps> = ({ guide }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="group bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-teal flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/repairs/${guide.$id}`)}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-brand-blue/5 text-brand-blue rounded-2xl group-hover:bg-brand-blue group-hover:text-white transition-colors">
          <Wrench className="w-6 h-6" />
        </div>
        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter border-slate-200">
          {guide.difficulty}
        </Badge>
      </div>

      <div className="flex-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {guide.category}
        </div>
        <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-blue transition-colors">
          {guide.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
          {guide.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
           <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> {t('repairs.technical_guide')}
        </div>
        <span className="text-brand-blue font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
           {t('repairs.view_steps')} <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </div>
  );
};
