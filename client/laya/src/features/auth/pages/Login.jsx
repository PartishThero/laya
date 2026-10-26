// pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col justify-center items-center p-6 relative select-none">
      {/* Top Left Return Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 p-2 rounded-md text-ink-faint hover:text-ink transition-all duration-200 flex items-center gap-1.5 text-xs font-mono group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Return to table</span>
      </Link>

      <div className="w-full max-w-sm page-enter">
        {/* Decorative accent line */}
        <div className="accent-line mx-auto mb-8" />

        <div className="bg-paper-2/80 border border-rule/40 p-8 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <span className="font-serif italic font-bold text-3xl text-ink tracking-tight">
              laya
            </span>
            <h1 className="font-serif text-lg font-medium text-ink mt-3">
              Welcome back to the table
            </h1>
            <p className="font-mono text-xs text-ink-faint mt-1.5">
              Access your playlists, saved music, and archive.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-danger/8 text-danger text-xs font-mono border border-danger/20 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-ink-faint mb-1.5 uppercase tracking-wider text-[10px] font-mono">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="curator or curator@laya.fm"
                className="input-premium"
                required
              />
            </div>

            <div>
              <label className="block text-ink-faint mb-1.5 uppercase tracking-wider text-[10px] font-mono">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-premium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 !rounded-lg mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Archive'}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-rule/30 text-center font-mono text-xs text-ink-faint">
            <span>First time here? </span>
            <Link to="/signup" className="text-accent hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
