import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VehicleProfile } from '../../types';
import { Button } from '../ui/Button';
import { Loader2 } from 'lucide-react';

interface VehicleFormProps {
  initialData?: Partial<VehicleProfile>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

/**
 * Fields mirror the `vehicles` collection schema:
 * make, model, year (string) and engine.
 */
export const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: String(initialData?.year || new Date().getFullYear()),
    engine: initialData?.engine || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: formData.year.trim(),
      engine: formData.engine.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.form_make')}</label>
          <input
            name="make"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            placeholder={t('vehicles.make_placeholder')}
            value={formData.make}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.form_model')}</label>
          <input
            name="model"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            placeholder={t('vehicles.model_placeholder')}
            value={formData.model}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.form_year')}</label>
          <input
            name="year"
            type="number"
            min="1900"
            max="2100"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            value={formData.year}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.form_engine')}</label>
          <input
            name="engine"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            placeholder={t('vehicles.engine_placeholder')}
            value={formData.engine}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          {t('shared.cancel')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData?.$id ? t('vehicles.save_changes') : t('vehicles.add_vehicle')}
        </Button>
      </div>
    </form>
  );
};
