import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { Loading } from '../components/ui/Loading';
import { ErrorState } from '../components/ui/Error';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesService } from '../services/database/vehicles';
import { VehicleProfile } from '../types';
import { Car, Plus, LayoutGrid, List } from 'lucide-react';

export const Vehicles = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchVehicles = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vehiclesService.listUserVehicles(user.$id);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || t('vehicles.failed_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleAddVehicle = async (data: any) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await vehiclesService.addVehicle(user.$id, data);
      setIsAdding(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || t('vehicles.failed_add'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-3">
              <Car className="w-8 h-8 text-brand-blue" /> {t('vehicles.title')}
            </h1>
            <p className="text-slate-500 mt-2">{t('vehicles.subtitle')}</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2 shadow-lg shadow-brand-blue/20">
              <Plus className="w-5 h-5" /> {t('vehicles.add_new')}
            </Button>
          )}
        </header>

        {isAdding ? (
          <div className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-3xl border shadow-xl animate-in fade-in zoom-in-95 duration-300">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-brand-navy">{t('vehicles.add_profile_title')}</h2>
                <p className="text-slate-500 mt-1">{t('vehicles.add_profile_desc')}</p>
             </div>
             <VehicleForm
                onSubmit={handleAddVehicle}
                onCancel={() => setIsAdding(false)}
                loading={loading}
             />
          </div>
        ) : loading ? (
          <Loading message={t('vehicles.fetching')} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchVehicles} />
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v.$id} vehicle={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 max-w-4xl mx-auto">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-brand-navy mb-2">{t('vehicles.empty_title')}</h3>
             <p className="text-slate-500 max-w-sm mx-auto mb-8">{t('vehicles.empty_desc')}</p>
             <Button onClick={() => setIsAdding(true)} size="lg" className="px-10">
                {t('vehicles.add_first')}
             </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
