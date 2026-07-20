'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setAdminToken } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await authAPI.login(email, password);
      setAdminToken(token);
      router.push('/admin/flights');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-surface p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm space-y-5 border-t-4 border-cta">
        <div>
          <p className="font-heading text-xs uppercase tracking-widest text-cta mb-1">PBM Admin</p>
          <h1 className="font-heading text-2xl font-extrabold text-navy">Sign in</h1>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-muted mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-muted mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-cta"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-2.5 bg-cta text-white rounded-md hover:bg-navy disabled:opacity-50 font-semibold transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
