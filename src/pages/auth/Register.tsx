import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appwriteAuth } from '../../services/auth/appwriteAuth';
import { account } from '../../lib/appwrite';
import { isNetworkError } from '../../lib/isNetworkError';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, Loader2 } from 'lucide-react';


export const Register = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

      // AuthContext creates the student profile through the JWT-verified Function.
      await refreshUser();
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration failed:', err);

      if (isNetworkError(err)) {
        setError(t('auth.network_error'));
      } else {
        const message = err instanceof Error ? err.message : '';
        setError(message || t('auth.registration_failed'));
      }
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
