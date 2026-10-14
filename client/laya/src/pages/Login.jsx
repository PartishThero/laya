// pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
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
        className="absolute top-6 left-6 p-2 rounded-xs border border-rule hover:border-accent text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5 text-xs font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to table</span>
      </Link>

      <div className="w-full max-w-sm bg-paper-2 border border-rule p-8 rounded-sm shadow-xl">
        <div className="text-center mb-8">
          <span className="font-serif italic font-bold text-3xl text-ink">
            laya
          </span>
          <h1 className="font-serif text-lg font-medium text-ink mt-2">
            Welcome back to the table
          </h1>
          <p className="font-mono text-xs text-ink-soft mt-1">
            Access your playlists, saved music, and archive.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-paper text-danger text-xs font-mono border border-danger/40 rounded-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-ink-soft mb-1 uppercase tracking-wider text-[10px]">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="curator or curator@laya.fm"
              className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-ink font-serif text-sm outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-ink-soft mb-1 uppercase tracking-wider text-[10px]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-ink font-serif text-sm outline-none focus:border-accent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ink text-paper font-mono text-xs rounded-xs hover:bg-accent transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Archive'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-rule/50 text-center font-mono text-xs text-ink-soft">
          <span>First time here? </span>
          <Link to="/signup" className="text-accent hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
