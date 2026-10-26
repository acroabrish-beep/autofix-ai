import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, ChevronRight, Activity, Clock } from 'lucide-react';
import { VehicleProfile } from '../../types';
import { useStorage } from '../../hooks/useStorage';

interface VehicleCardProps {
  vehicle: VehicleProfile;
  isActive?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isActive }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFilePreview, BUCKETS } = useStorage();

  return (
    <div
      className={`group bg-white rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col h-full cursor-pointer ${
        isActive ? 'border-brand-teal' : 'border-slate-100 hover:border-brand-blue/30'
      }`}
      onClick={() => navigate(`/vehicles/${vehicle.$id}`)}
    >
      <div className="flex justify-between items-start mb-6">
        {vehicle.imageFileId ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
             <img src={getFilePreview(BUCKETS.VEHICLES, vehicle.imageFileId)} alt={t('vehicles.title')} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`p-4 rounded-2xl ${isActive ? 'bg-brand-teal/10 text-brand-teal' : 'bg-slate-100 text-slate-400'} group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors`}>
            <Car className="w-8 h-8" />
          </div>
        )}
        {isActive && (
          <span className="bg-brand-teal text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">{t('vehicles.active')}</span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-brand-navy mb-1">{vehicle.make} {vehicle.model}</h3>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <span>{vehicle.year}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{vehicle.engine}</span>
        </div>

        <div className="space-y-3">
          {typeof vehicle.mileage === 'number' && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
               <Activity className="w-3.5 h-3.5" />
               <span>{vehicle.mileage.toLocaleString()} KM</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
             <Clock className="w-3.5 h-3.5" />
             <span>{t('vehicles.updated', { date: new Date(vehicle.$updatedAt).toLocaleDateString() })}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between group-hover:text-brand-blue transition-colors">
         <span className="text-sm font-bold">{t('vehicles.view_profile')}</span>
         <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
