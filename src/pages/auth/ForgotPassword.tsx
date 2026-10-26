import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appwriteAuth } from '../../services/auth/appwriteAuth';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, Loader2, Mail } from 'lucide-react';

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await appwriteAuth.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('auth.something_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h2 className="text-2xl font-bold text-brand-navy">{t('auth.reset_title')}</h2>
          <p className="text-slate-600 mt-2">{t('auth.reset_subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t('auth.check_email')}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('auth.reset_sent', { email })}
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSuccess(false)}>
                {t('auth.try_another')}
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-6">
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

                <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? t('auth.sending') : t('auth.send_reset')}
                </Button>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-sm text-slate-600">
            {t('auth.remember_password')}{' '}
            <Link to="/login" className="text-brand-blue font-semibold hover:underline">
              {t('auth.sign_in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
