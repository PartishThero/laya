// pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        displayName: displayName.trim() || username.trim(),
        password
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col justify-center items-center p-6 relative select-none">
      <Link
        to="/"
        className="absolute top-6 left-6 p-2 rounded-xs border border-rule hover:border-accent text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5 text-xs font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to table</span>
      </Link>

      <div className="w-full max-w-sm bg-paper-2 border border-rule p-8 rounded-sm shadow-xl">
        <div className="text-center mb-6">
          <span className="font-serif italic font-bold text-3xl text-ink">
            laya
          </span>
          <h1 className="font-serif text-lg font-medium text-ink mt-2">
            Claim your personal table
          </h1>
          <p className="font-mono text-xs text-ink-soft mt-1">
            Build playlists, remember favorites, keep track.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-paper text-danger text-xs font-mono border border-danger/40 rounded-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-ink-soft mb-1 uppercase tracking-wider text-[10px]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="listener"
              className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-ink font-serif text-sm outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-ink-soft mb-1 uppercase tracking-wider text-[10px]">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3 py-2 bg-paper border border-rule rounded-xs text-ink font-serif text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-ink-soft mb-1 uppercase tracking-wider text-[10px]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="listener@example.com"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-rule/50 text-center font-mono text-xs text-ink-soft">
          <span>Already registered? </span>
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
