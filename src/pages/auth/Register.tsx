import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appwriteAuth } from '../../services/auth/appwriteAuth';
import { account } from '../../lib/appwrite';
import { profilesService } from '../../services/database/profiles';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '../../types';

export const Register = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // If a session is already active, skip the registration form.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await account.get();
        if (!cancelled) {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // No active session — stay on the registration page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 0. Clear any ghost/active session first. Appwrite rejects
      //    createEmailPasswordSession while another session is active.
      try {
        await account.deleteSession('current');
      } catch {
        // No active session to delete — safe to continue.
      }

      // 1. Create the Appwrite account.
      const createdAccount = await appwriteAuth.register(email, password, fullName);

      // 2. Immediately start a session so the new user is logged in.
      //    (SDK 26 renamed createEmailSession -> createEmailPasswordSession.)
      await appwriteAuth.login(email, password);

      // 3. Create the database profile. Permissions require an active
      //    session, so this must happen after login.
      try {
        await profilesService.createProfile({
          userId: createdAccount.$id,
          fullName,
          email,
          role,
        });
      } catch (profileError) {
        // Don't block sign-up if the profile write fails; AuthContext will
        // create/fetch a fallback profile.
        console.warn('Profile creation failed:', profileError);
      }

      // 4. Hydrate the auth context and go straight to the dashboard.
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('auth.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h2 className="text-2xl font-bold text-brand-navy">{t('auth.register_title')}</h2>
          <p className="text-slate-600 mt-2">{t('auth.register_subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('auth.full_name')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                placeholder={t('auth.name_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                placeholder={t('auth.password_hint')}
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('auth.role_label')}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none bg-white transition-all"
              >
                <option value="student">{t('auth.role_student')}</option>
                <option value="mechanic">{t('auth.role_mechanic')}</option>
                <option value="teacher">{t('auth.role_teacher')}</option>
                <option value="vehicle_owner">{t('auth.role_owner')}</option>
              </select>
            </div>

            <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {loading ? t('auth.creating') : t('auth.create_account')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-brand-blue font-semibold hover:underline">
              {t('auth.sign_in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
