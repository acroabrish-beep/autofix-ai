import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userVehiclesService } from '../../services/database/userVehicles';
import { useAuth } from '../../contexts/AuthContext';
import { UserVehicle, DiagnosticRequest } from '../../types';
import { Button } from '../ui/Button';
import { Car, ChevronRight, AlertCircle } from 'lucide-react';

// Values stay in English because they are sent to the diagnostic model.
const TIMING_OPTIONS = [
  { value: 'Recently', labelKey: 'diagnostics.timing_recently' },
  { value: 'A few days ago', labelKey: 'diagnostics.timing_days' },
  { value: 'More than a week ago', labelKey: 'diagnostics.timing_week' },
  { value: 'Intermittent problem', labelKey: 'diagnostics.timing_intermittent' },
] as const;

const WARNING_LIGHT_OPTIONS = [
  { value: 'Check Engine', labelKey: 'diagnostics.light_check_engine' },
  { value: 'ABS', labelKey: 'diagnostics.light_abs' },
  { value: 'Battery', labelKey: 'diagnostics.light_battery' },
  { value: 'Oil', labelKey: 'diagnostics.light_oil' },
  { value: 'Brake', labelKey: 'diagnostics.light_brake' },
] as const;

interface DiagnosticFormProps {
  onSubmit: (request: DiagnosticRequest) => Promise<any>;
  loading: boolean;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(location.state?.vehicleId || '');
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [warningLights, setWarningLights] = useState<string[]>([]);
  const [timing, setTiming] = useState('Recently');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    userVehiclesService
      .listUserVehicles(user.$id)
      .then((result) => {
        if (!cancelled) setVehicles(result);
      })
      .catch((error) => {
        console.error('Failed to load vehicles:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDescription = description.trim();
    if (!selectedVehicleId || trimmedDescription.length <= 5) return;

    onSubmit({
      vehicleId: selectedVehicleId,
      description: trimmedDescription,
      symptoms,
      timing,
      warningLights
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-xl border">
      <div>
        <h3 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
          <Car className="w-6 h-6 text-brand-teal" /> {t('diagnostics.select_vehicle')}
        </h3>
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <button
                key={v.$id}
                type="button"
                onClick={() => setSelectedVehicleId(v.$id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedVehicleId === v.$id
                  ? 'border-brand-blue bg-brand-blue/5'
                  : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900">{v.make} {v.model}</div>
                <div className="text-xs text-slate-500">
                  {v.year}{v.engine ? ` • ${v.engine}` : ''}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed text-center">
            <p className="text-slate-500 mb-4">{t('diagnostics.no_vehicles')}</p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => navigate('/vehicles/add')}
            >
              {t('diagnostics.add_vehicle_first')}
            </Button>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-xl font-bold text-brand-navy mb-6">{t('diagnostics.describe_problem')}</h3>
        <textarea
          required
          className="w-full min-h-[150px] p-6 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue outline-none text-slate-700 placeholder:text-slate-400"
          placeholder={t('diagnostics.describe_placeholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-12">
         <div>
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">{t('diagnostics.when_started')}</label>
            <select
              className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-brand-blue"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
            >
               {TIMING_OPTIONS.map((option) => (
                 <option key={option.value} value={option.value}>
                   {t(option.labelKey)}
                 </option>
               ))}
            </select>
         </div>
         <div>
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">{t('diagnostics.warning_lights')}</label>
            <div className="flex flex-wrap gap-3">
               {WARNING_LIGHT_OPTIONS.map(({ value, labelKey }) => (
                 <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setWarningLights(prev =>
                        prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value]
                      )
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      warningLights.includes(value)
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                 >
                    {t(labelKey)}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <div className="pt-12">
        {!selectedVehicleId && vehicles.length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">{t('diagnostics.select_vehicle_required')}</p>
          </div>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full py-8 text-xl shadow-xl shadow-brand-blue/20"
          disabled={loading || !selectedVehicleId || description.trim().length <= 5}
        >
          {loading ? t('diagnostics.analyzing') : t('diagnostics.start_diagnostic')} <ChevronRight className="ml-2 w-6 h-6" />
        </Button>
        <p className="text-center text-slate-400 text-xs mt-6 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" /> {t('diagnostics.guidance_only')}
        </p>
      </div>
    </form>
  );
};
