import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AvatarUpload } from '../components/profile/AvatarUpload';
import { useAuth } from '../contexts/AuthContext';
import { profilesService } from '../services/database/profiles';
import { Button } from '../components/ui/Button';
import { User, Settings as SettingsIcon, Mail, Shield, Globe, Loader2 } from 'lucide-react';

export const Settings = () => {
  const { t } = useTranslation();
  const { user, profile, refreshUser } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'en');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setUpdating(true);
    try {
      await profilesService.updateProfile(profile.$id, {
        fullName,
        preferredLanguage: language
      });
      await refreshUser();
      alert(t('settings.profile_updated'));
    } catch (err) {
      alert(t('settings.profile_update_failed'));
    } finally {
      setUpdating(false);
    }
  };

  const onAvatarUpload = async (fileId: string) => {
    if (!profile) return;
    await profilesService.updateProfile(profile.$id, { avatarFileId: fileId });
    await refreshUser();
  };

  const onAvatarRemove = async () => {
    if (!profile) return;
    await profilesService.updateProfile(profile.$id, { avatarFileId: '' });
    await refreshUser();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-brand-blue" /> {t('settings.title')}
            </h1>
            <p className="text-slate-500 mt-2">{t('settings.subtitle')}</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Left Column: Avatar & Quick Info */}
             <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border shadow-xl text-center">
                   <AvatarUpload
                      currentFileId={profile?.avatarFileId}
                      onUploadComplete={onAvatarUpload}
                      onRemove={onAvatarRemove}
                   />
                   <div className="mt-6">
                      <h3 className="font-bold text-slate-900 text-lg">{profile?.fullName}</h3>
                      <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">
                        {profile?.role
                          ? t(
                              `auth.role_${profile.role === 'vehicle_owner' ? 'owner' : profile.role}`,
                              { defaultValue: profile.role }
                            )
                          : ''}
                      </span>
                   </div>
                </div>

                <div className="bg-brand-blue p-6 rounded-3xl text-white shadow-lg">
                   <div className="flex items-center gap-3 mb-4 font-bold">
                      <Shield className="w-5 h-5 text-brand-teal" /> {t('settings.account_status')}
                   </div>
                   <p className="text-sm text-white/80 leading-relaxed mb-6">
                      {t('settings.account_active')}
                   </p>
                   <div className="text-xs font-mono bg-white/10 p-3 rounded-xl border border-white/10">
                      {t('settings.account_id')}: {user?.$id.slice(0, 12)}...
                   </div>
                </div>
             </div>

             {/* Right Column: Forms */}
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 lg:p-10 rounded-3xl border shadow-sm">
                   <h2 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-2">
                      <User className="w-5 h-5 text-brand-blue" /> {t('settings.personal_info')}
                   </h2>
                   <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('settings.full_name')}</label>
                            <input
                               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
                               value={fullName}
                               onChange={(e) => setFullName(e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t('settings.email')}</label>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed">
                               <Mail className="w-4 h-4" /> {user?.email}
                            </div>
                         </div>
                      </div>

                      <div className="pt-4">
                         <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                            <Globe className="w-4 h-4" /> {t('settings.preferred_language')}
                         </label>
                         <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                         >
                            <option value="en">{t('settings.english_global')}</option>
                            <option value="am">{t('settings.amharic')}</option>
                            <option value="om">{t('settings.oromo')}</option>
                            <option value="sid">{t('settings.sidama')}</option>
                         </select>
                         <p className="text-xs text-slate-400 mt-2">{t('settings.language_hint')}</p>
                      </div>

                      <div className="pt-6 border-t border-slate-50 flex justify-end">
                         <Button type="submit" disabled={updating} className="px-10">
                            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('settings.save_profile')}
                         </Button>
                      </div>
                   </form>
                </div>

                <div className="bg-white p-8 lg:p-10 rounded-3xl border shadow-sm border-red-100">
                   <h2 className="text-xl font-bold text-red-600 mb-2">{t('settings.danger_zone')}</h2>
                   <p className="text-sm text-slate-500 mb-8">{t('settings.danger_desc')}</p>
                   <Button variant="outline" className="text-red-500 hover:bg-red-50 border-red-200 hover:text-red-600">
                      {t('settings.delete_account')}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
