import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceRecord } from '../../types';
import { Button } from '../ui/Button';
import { Loader2, Calendar, Paperclip, X, FileText } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

interface ServiceRecordFormProps {
  vehicleId: string;
  initialData?: Partial<ServiceRecord>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const SERVICE_TYPES = [
  { value: 'Oil Change', key: 'vehicles.oil_change' },
  { value: 'Brake Service', key: 'vehicles.brake_service' },
  { value: 'Tire Rotation', key: 'vehicles.tire_rotation' },
  { value: 'Battery Replacement', key: 'vehicles.battery_replacement' },
  { value: 'Engine Diagnostic', key: 'vehicles.engine_diagnostic' },
  { value: 'General Maintenance', key: 'vehicles.general_maintenance' },
  { value: 'Repair', key: 'vehicles.repair' },
];

export const ServiceRecordForm: React.FC<ServiceRecordFormProps> = ({
  vehicleId,
  initialData,
  onSubmit,
  onCancel,
  loading
}) => {
  const { t } = useTranslation();
  const { uploadFile, BUCKETS } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentFileId, setAttachmentFileId] = useState(initialData?.attachmentFileId || '');
  const [uploadingFile, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId,
    serviceType: initialData?.serviceType || 'Maintenance',
    description: initialData?.description || '',
    mileage: initialData?.mileage || 0,
    cost: initialData?.cost || 0,
    provider: initialData?.provider || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await uploadFile(BUCKETS.SERVICE_RECEIPTS, file);
      setAttachmentFileId(response.$id);
    } catch (err) {
      alert(t('vehicles.upload_failed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' || name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, attachmentFileId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.service_type')}</label>
          <select
            name="serviceType"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
            value={formData.serviceType}
            onChange={handleChange}
          >
            {SERVICE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.key)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
             <Calendar className="w-4 h-4" /> {t('vehicles.date')}
          </label>
          <input
            name="date"
            type="date"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.short_description')}</label>
        <input
          name="description"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
          placeholder={t('vehicles.desc_placeholder')}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.mileage')}</label>
          <input
            name="mileage"
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            value={formData.mileage}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.cost')}</label>
          <input
            name="cost"
            type="number"
            step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            value={formData.cost}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('vehicles.provider')}</label>
          <input
            name="provider"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
            placeholder={t('vehicles.provider_placeholder')}
            value={formData.provider}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center justify-between">
           <span>{t('vehicles.notes')}</span>
           <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-bold"
           >
              <Paperclip className="w-3 h-3" /> {t('vehicles.attach_receipt')}
           </button>
        </label>

        {attachmentFileId && (
          <div className="mb-3 p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase">
                <FileText className="w-4 h-4 text-brand-blue" /> {t('vehicles.document_attached')}
             </div>
             <button type="button" onClick={() => setAttachmentFileId('')} className="text-red-500 hover:text-red-600">
                <X className="w-4 h-4" />
             </button>
          </div>
        )}
        {uploadingFile && <div className="mb-3 text-xs text-brand-blue animate-pulse font-bold">{t('vehicles.uploading')}</div>}

        <textarea
          name="notes"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px]"
          placeholder={t('vehicles.notes_placeholder')}
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />

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
          {initialData?.$id ? t('vehicles.update_record') : t('vehicles.save_record')}
        </Button>
      </div>
    </form>
  );
};
