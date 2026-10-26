import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appwriteAuth } from '../../services/auth/appwriteAuth';
import { account } from '../../lib/appwrite';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, Loader2 } from 'lucide-react';

/** Fail the request instead of leaving the button stuck forever. */
const AUTH_TIMEOUT_MS = 20_000;

const withTimeout = <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // If a session is already active, skip the login form.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await account.get();
        if (!cancelled) {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // No active session — stay on the login page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Appwrite SDK 26+: `createEmailSession` no longer exists.
      // `appwriteAuth.login` calls `account.createEmailPasswordSession`.
      await withTimeout(
        appwriteAuth.login(email, password),
        AUTH_TIMEOUT_MS,
        t('auth.timeout')
      );

      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.message || t('auth.invalid_credentials'));
    } finally {
      // Always runs — resolved, rejected, or timed out.
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h2 className="text-2xl font-bold text-brand-navy">{t('auth.login_title')}</h2>
          <p className="text-slate-600 mt-2">{t('auth.login_subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-sm text-brand-blue hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? t('auth.signing_in') : t('auth.sign_in')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-brand-blue font-semibold hover:underline">
              {t('auth.create_free')}
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-slate-500 hover:text-brand-navy text-sm transition-colors">
            ← {t('auth.back_landing')}
          </Link>
        </div>
      </div>
    </div>
  );
};
