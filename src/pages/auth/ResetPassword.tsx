import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { account } from '../../lib/appwrite';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const userId = params.get('userId') || '';
  const secret = params.get('secret') || '';
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!userId || !secret) return setError('This password setup link is invalid or incomplete. Request a new invitation email.');
    if (password.length < 8) return setError('Password must contain at least 8 characters.');
    if (password !== passwordAgain) return setError('The passwords do not match.');
    setLoading(true);
    try {
      await account.updateRecovery(userId, secret, password, passwordAgain);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to set your password. Request a new invitation link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy">Set your AutoFix AI password</h1>
          <p className="text-slate-600 mt-2">Create a password to activate your invited account.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h2 className="font-bold text-slate-900 mb-2">Password created</h2>
              <p className="text-sm text-slate-600 mb-6">Your account is ready. Sign in with your email and new password.</p>
              <Link to="/login" className="inline-flex w-full justify-center rounded-xl bg-brand-blue px-5 py-3 font-semibold text-white">Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm"><AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span></div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
                <input type="password" required minLength={8} autoComplete="new-password" value={passwordAgain} onChange={(e) => setPasswordAgain(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none" />
              </div>
              <Button type="submit" className="w-full py-6 text-lg" disabled={loading || !userId || !secret}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {loading ? 'Saving password…' : 'Set password'}
              </Button>
            </form>
          )}
          <div className="mt-8 text-center text-sm text-slate-600"><Link to="/login" className="text-brand-blue font-semibold hover:underline">Back to sign in</Link></div>
        </div>
      </div>
    </div>
  );
};
