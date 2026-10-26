import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './sections/Hero';
import { Trust } from './sections/Trust';
import { Solutions } from './sections/Solutions';
import { Modules } from './sections/Modules';
import { WhoWeServe } from './sections/WhoWeServe';
import { HowItWorks } from './sections/HowItWorks';
import { TVET } from './sections/TVET';
import { DiagnosticPreview } from './sections/DiagnosticPreview';
import { Impact } from './sections/Impact';
import { CTA } from './sections/CTA';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Learning } from './pages/Learning';
import { LearningModule } from './pages/LearningModule';
import { VirtualLab } from './pages/VirtualLab';
import { Diagnostics } from './pages/Diagnostics';
import { DiagnosticHistory } from './pages/DiagnosticHistory';
import { Vehicles } from './pages/Vehicles';
import { VehicleDetails } from './pages/VehicleDetails';
import { AddVehicle } from './pages/vehicles/AddVehicle';
import { Settings } from './pages/Settings';
import { Repairs } from './pages/Repairs';
import { RepairDetail } from './pages/RepairDetail';
import { Search } from './pages/Search';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = () => {
  const { t } = useTranslation();

  return (
  <div className="min-h-screen bg-white">
    <Navbar />
    <main>
      <Hero />
      <Trust />
      <Solutions />
      <Modules />
      <WhoWeServe />
      <HowItWorks />
      <TVET />
      <DiagnosticPreview />

      {/* Future Platform Preview */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-navy mb-4">{t('extras.coming_title')}</h2>
              <p className="text-slate-600">{t('extras.coming_subtitle')}</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="text-center p-6 border rounded-2xl">
                  <div className="font-bold text-slate-900 mb-1">{t('extras.coming_obd_title')}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-tighter">{t('extras.coming_obd_desc')}</div>
              </div>
              <div className="text-center p-6 border rounded-2xl">
                  <div className="font-bold text-slate-900 mb-1">{t('extras.coming_virtual_title')}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-tighter">{t('extras.coming_virtual_desc')}</div>
              </div>
              <div className="text-center p-6 border rounded-2xl">
                  <div className="font-bold text-slate-900 mb-1">{t('extras.coming_marketplace_title')}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-tighter">{t('extras.coming_marketplace_desc')}</div>
              </div>
              <div className="text-center p-6 border rounded-2xl">
                  <div className="font-bold text-slate-900 mb-1">{t('extras.coming_certs_title')}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-tighter">{t('extras.coming_certs_desc')}</div>
              </div>
           </div>
        </div>
      </section>

      <Impact />
      <CTA />
    </main>
    <Footer />
  </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning/:moduleId"
          element={
            <ProtectedRoute>
              <LearningModule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lab/:moduleId"
          element={
            <ProtectedRoute>
              <VirtualLab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diagnostics"
          element={
            <ProtectedRoute>
              <Diagnostics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diagnostics/history"
          element={
            <ProtectedRoute>
              <DiagnosticHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/add"
          element={
            <ProtectedRoute>
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:vehicleId"
          element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repairs"
          element={
            <ProtectedRoute>
              <Repairs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/repairs/:guideId"
          element={
            <ProtectedRoute>
              <RepairDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
