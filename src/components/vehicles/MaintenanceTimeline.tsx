import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Brain,
  ChevronRight,
  Calendar,
  Activity,
  History as HistoryIcon
} from 'lucide-react';
import { ServiceRecord, DiagnosticSession } from '../../types';
import { localizeServiceType } from '../../lib/localizeContent';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'DIAGNOSTIC' | 'SERVICE';
  title: string;
  summary: string;
  data: any;
}

interface MaintenanceTimelineProps {
  services: ServiceRecord[];
  diagnostics: DiagnosticSession[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ services, diagnostics }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const events: TimelineEvent[] = [
    ...services.map(s => ({
      id: s.$id,
      date: s.date,
      type: 'SERVICE' as const,
      title: localizeServiceType(s.serviceType, t),
      summary: s.description || t('vehicles.maintenance_record'),
      data: s
    })),
    ...diagnostics.map(d => ({
      id: d.$id,
      date: d.$createdAt,
      type: 'DIAGNOSTIC' as const,
      title: t('vehicles.ai_diagnostic'),
      summary: d.userInput,
      data: d
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
         <HistoryIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
         <p className="text-slate-400 font-medium">{t('vehicles.timeline_empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100"></div>

      {events.map((event, idx) => (
        <div key={`${event.type}-${event.id}`} className="relative pl-16 group">
          <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-sm border-4 border-white transition-all group-hover:scale-110 ${
            event.type === 'SERVICE' ? 'bg-teal-500 text-white' : 'bg-brand-blue text-white'
          }`}>
            {event.type === 'SERVICE' ? <Wrench className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all group-hover:shadow-xl group-hover:border-brand-teal/30 cursor-pointer"
               onClick={() => event.type === 'DIAGNOSTIC' ? navigate('/diagnostics/history') : null}>
            <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className={event.type === 'SERVICE' ? 'text-teal-600' : 'text-brand-blue'}>
                    {event.type === 'SERVICE' ? t('vehicles.repair') : t('vehicles.ai_diagnostic')}
                  </span>
               </div>
            </div>

            <h4 className="font-bold text-slate-900 text-lg mb-1">{event.title}</h4>
            <p className="text-slate-500 text-sm line-clamp-2">{event.summary}</p>

            <div className="mt-4 flex items-center justify-end text-brand-blue text-xs font-bold group-hover:underline">
               {event.type === 'DIAGNOSTIC' ? t('vehicles.view_analysis') : t('vehicles.service_details')} <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
