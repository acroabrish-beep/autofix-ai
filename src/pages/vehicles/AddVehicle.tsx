import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, ID } from '../../lib/appwrite';
import { Permission, Role } from 'appwrite';
import { COLLECTIONS } from '../../services/database';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { AlertCircle, ArrowLeft, Car, Loader2 } from 'lucide-react';

export const AddVehicle = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericYear = Number(year.trim());
    if (
      !year.trim() ||
      !Number.isInteger(numericYear) ||
      numericYear < 1886 ||
      numericYear > 2100
    ) {
      setError(t('vehicles.year_invalid'));
      return;
    }

    setSaving(true);

    try {
      // 1. Identify the signed-in user.
      const currentUser = await account.get();

      // 2. Persist the free-text vehicle details.
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.VEHICLES,
        ID.unique(),
        {
          userId: currentUser.$id,
          make: make.trim(),
          model: model.trim(),
          year: String(numericYear),
          engine: engine.trim(),
        },
        [
          Permission.read(Role.user(currentUser.$id)),
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      );

      // 3. Back to diagnostics so the new vehicle is selectable.
      navigate('/diagnostics', { replace: true });
    } catch (err: any) {
      console.error('Failed to save vehicle:', err);
      setError(err?.message || t('vehicles.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/diagnostics"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-navy transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> {t('vehicles.back_to_diagnostics')}
          </Link>

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
            <div className="p-8 lg:p-10 border-b bg-slate-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                  <Car className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-brand-navy">{t('vehicles.add_vehicle_title')}</h1>
              </div>
              <p className="text-slate-600">
                {t('vehicles.add_vehicle_desc')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="make" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('vehicles.form_make')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="make"
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder={t('vehicles.make_placeholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('vehicles.form_model')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="model"
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={t('vehicles.model_placeholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('vehicles.form_year')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="year"
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={4}
                    value={year}
                    onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={t('vehicles.year_placeholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="engine" className="block text-sm font-bold text-slate-700 mb-2">
                    {t('vehicles.engine_optional')}
                  </label>
                  <input
                    id="engine"
                    type="text"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder={t('vehicles.engine_placeholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 py-6 text-lg shadow-lg shadow-brand-blue/20"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('vehicles.saving')}
                    </>
                  ) : (
                    t('vehicles.save_vehicle')
                  )}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="py-6"
                  onClick={() => navigate('/diagnostics')}
                  disabled={saving}
                >
                  {t('shared.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
